from flask import Flask, render_template, jsonify
from Scraper import lodeStoneScraper

app = Flask(__name__)
lss = lodeStoneScraper()

@app.route('/')
def index():
    return render_template('index.html', data=lss.get_data())

@app.route('/data')
def data():
    return jsonify(lss.get_data())

@app.route('/google7c4ac61d208393c8.html')
def google_verify():
    return render_template('google7c4ac61d208393c8.html')

if __name__ == '__main__':
    app.run()