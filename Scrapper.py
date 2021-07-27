import requests

from bs4 import BeautifulSoup

class lodeStoneScrapper:
    def __init__(self):
        self.__URL = 'https://na.finalfantasyxiv.com/lodestone/worldstatus/'
        self.__statistics = {}

    # Called to update the stored information on the servers
    def update_page(self):
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
