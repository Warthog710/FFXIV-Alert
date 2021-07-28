import requests
import atexit

from apscheduler.schedulers.background import BackgroundScheduler
from bs4 import BeautifulSoup

class lodeStoneScraper:
    def __init__(self):
        self.__URL = 'https://na.finalfantasyxiv.com/lodestone/worldstatus/'
        self.__statistics = {}
        self.update_page()

        # Setup scheduler
        self.__scheduler = BackgroundScheduler()
        self.__scheduler.add_job(func=self.update_page, trigger='interval', seconds=15)
        self.__scheduler.start()

        # Setup atexit
        atexit.register(lambda: self.__scheduler.shutdown())

    # Called to update the stored information on the servers
    def update_page(self):
        # Save old data
        temp = self.__statistics

        try:
            # Get the page content and parse it
            page = requests.get(self.__URL)
            page = BeautifulSoup(page.content, 'html.parser')

            # Extract the relevant divs
            server_names = page.find_all('div', class_='world-list__world_name')
            server_types = page.find_all('div', class_='world-list__world_category')
            server_char_status = page.find_all('div', class_='world-list__create_character')
            server_online_status = page.find_all('div', class_='world-list__status_icon')

            # Parse into text
            server_names = self.__parse_name(server_names)
            server_types = self.__parse_type(server_types)
            server_char_status = self.__parse_char_status(server_char_status)
            server_online_status = self.__parse_server_online_status(server_online_status)

            # Collate the data
            for x in range(0, len(server_names)):
                self.__statistics[server_names[x]] = [server_types[x], server_char_status[x], server_online_status[x]]

            # Package the data by organizing into ordered data center lists
            self.__statistics = self.__package_data()
        except Exception as e:
            # If update failed, restore old data
            self.__statistics = temp

            # Log error
            print(f'An exception occurred while trying to update data: {e}')

    def get_data(self):
        return self.__statistics

    def __parse_name(self, server_names):
        names = []
        for server in server_names:
            names.append(server.find('p').getText())
        return names

    def __parse_type(self, server_types):
        types = []
        for item in server_types:
            types.append(item.find('p').getText())
        return types

    def __parse_char_status(self, server_char_status):
        char_states = []
        for item in server_char_status:
            state = item.i['data-tooltip']
            if 'Available' in state:
                char_states.append(True)
            else:
                char_states.append(False)
        return char_states

    def __parse_server_online_status(self, server_online_status):
        online_states = []
        for item in server_online_status:
           state = item.i['data-tooltip']
           if 'Online' in state:
               online_states.append(True)
           else:
               online_states.append(False)
        return online_states

    def __package_data(self):
        packaged_data = {}

        # Package data for Elemental
        packaged_data['elemental'] = []
        packaged_data['elemental'].append(['Aegis'] + self.__statistics['Aegis'])
        packaged_data['elemental'].append(['Atomos'] + self.__statistics['Atomos'])
        packaged_data['elemental'].append(['Carbuncle'] + self.__statistics['Carbuncle'])
        packaged_data['elemental'].append(['Garuda'] + self.__statistics['Garuda'])
        packaged_data['elemental'].append(['Gungnir'] + self.__statistics['Gungnir'])
        packaged_data['elemental'].append(['Kujata'] + self.__statistics['Kujata'])
        packaged_data['elemental'].append(['Ramuh'] + self.__statistics['Ramuh'])
        packaged_data['elemental'].append(['Tonberry'] + self.__statistics['Tonberry'])
        packaged_data['elemental'].append(['Typhon'] + self.__statistics['Typhon'])
        packaged_data['elemental'].append(['Unicorn'] + self.__statistics['Unicorn'])

        # Package data for Gaia
        packaged_data['gaia'] = []
        packaged_data['gaia'].append(['Alexander'] + self.__statistics['Alexander'])
        packaged_data['gaia'].append(['Bahamut'] + self.__statistics['Bahamut'])
        packaged_data['gaia'].append(['Durandal'] + self.__statistics['Durandal'])
        packaged_data['gaia'].append(['Fenrir'] + self.__statistics['Fenrir'])
        packaged_data['gaia'].append(['Ifrit'] + self.__statistics['Ifrit'])
        packaged_data['gaia'].append(['Ridill'] + self.__statistics['Ridill'])
        packaged_data['gaia'].append(['Tiamat'] + self.__statistics['Tiamat'])
        packaged_data['gaia'].append(['Ultima'] + self.__statistics['Ultima'])
        packaged_data['gaia'].append(['Valefor'] + self.__statistics['Valefor'])
        packaged_data['gaia'].append(['Yojimbo'] + self.__statistics['Yojimbo'])
        packaged_data['gaia'].append(['Zeromus'] + self.__statistics['Zeromus'])

        # Package data for Mana
        packaged_data['mana'] = []
        packaged_data['mana'].append(['Anima'] + self.__statistics['Anima'])
        packaged_data['mana'].append(['Asura'] + self.__statistics['Asura'])
        packaged_data['mana'].append(['Belias'] + self.__statistics['Belias'])
        packaged_data['mana'].append(['Chocobo'] + self.__statistics['Chocobo'])
        packaged_data['mana'].append(['Hades'] + self.__statistics['Hades'])
        packaged_data['mana'].append(['Ixion'] + self.__statistics['Ixion'])
        packaged_data['mana'].append(['Mandragora'] + self.__statistics['Mandragora'])
        packaged_data['mana'].append(['Masamune'] + self.__statistics['Masamune'])
        packaged_data['mana'].append(['Pandaemonium'] + self.__statistics['Pandaemonium'])
        packaged_data['mana'].append(['Shinryu'] + self.__statistics['Shinryu'])
        packaged_data['mana'].append(['Titan'] + self.__statistics['Titan'])

        # Package data for Aether
        packaged_data['aether'] = []
        packaged_data['aether'].append(['Adamantoise'] + self.__statistics['Adamantoise'])
        packaged_data['aether'].append(['Cactuar'] + self.__statistics['Cactuar'])
        packaged_data['aether'].append(['Faerie'] + self.__statistics['Faerie'])
        packaged_data['aether'].append(['Gilgamesh'] + self.__statistics['Gilgamesh'])
        packaged_data['aether'].append(['Jenova'] + self.__statistics['Jenova'])
        packaged_data['aether'].append(['Midgardsormr'] + self.__statistics['Midgardsormr'])
        packaged_data['aether'].append(['Sargatanas'] + self.__statistics['Sargatanas'])
        packaged_data['aether'].append(['Siren'] + self.__statistics['Siren'])

        # Package data for Primal
        packaged_data['primal'] = []
        packaged_data['primal'].append(['Behemoth'] + self.__statistics['Behemoth'])
        packaged_data['primal'].append(['Excalibur'] + self.__statistics['Excalibur'])
        packaged_data['primal'].append(['Exodus'] + self.__statistics['Exodus'])
        packaged_data['primal'].append(['Famfrit'] + self.__statistics['Famfrit'])
        packaged_data['primal'].append(['Hyperion'] + self.__statistics['Hyperion'])
        packaged_data['primal'].append(['Lamia'] + self.__statistics['Lamia'])
        packaged_data['primal'].append(['Leviathan'] + self.__statistics['Leviathan'])
        packaged_data['primal'].append(['Ultros'] + self.__statistics['Ultros'])

        # Package data for Crystal
        packaged_data['crystal'] = []
        packaged_data['crystal'].append(['Balmung'] + self.__statistics['Balmung'])
        packaged_data['crystal'].append(['Brynhildr'] + self.__statistics['Brynhildr'])
        packaged_data['crystal'].append(['Coeurl'] + self.__statistics['Coeurl'])
        packaged_data['crystal'].append(['Diabolos'] + self.__statistics['Diabolos'])
        packaged_data['crystal'].append(['Goblin'] + self.__statistics['Goblin'])
        packaged_data['crystal'].append(['Malboro'] + self.__statistics['Malboro'])
        packaged_data['crystal'].append(['Mateus'] + self.__statistics['Mateus'])
        packaged_data['crystal'].append(['Zalera'] + self.__statistics['Zalera'])

        # Package data for Chaos
        packaged_data['chaos'] = []
        packaged_data['chaos'].append(['Cerberus'] + self.__statistics['Cerberus'])
        packaged_data['chaos'].append(['Louisoix'] + self.__statistics['Louisoix'])
        packaged_data['chaos'].append(['Moogle'] + self.__statistics['Moogle'])
        packaged_data['chaos'].append(['Omega'] + self.__statistics['Omega'])
        packaged_data['chaos'].append(['Ragnarok'] + self.__statistics['Ragnarok'])
        packaged_data['chaos'].append(['Spriggan'] + self.__statistics['Spriggan'])

        # Package data for Light
        packaged_data['light'] = []
        packaged_data['light'].append(['Lich'] + self.__statistics['Lich'])
        packaged_data['light'].append(['Odin'] + self.__statistics['Odin'])
        packaged_data['light'].append(['Phoenix'] + self.__statistics['Phoenix'])
        packaged_data['light'].append(['Shiva'] + self.__statistics['Shiva'])
        packaged_data['light'].append(['Twintania'] + self.__statistics['Twintania'])
        packaged_data['light'].append(['Zodiark'] + self.__statistics['Zodiark'])

        return packaged_data
