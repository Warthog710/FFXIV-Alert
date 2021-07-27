from flask import Flask, render_template, request

from Scrapper import lodeStoneScrapper

app = Flask(__name__)

lss = lodeStoneScrapper()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)