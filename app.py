import os
import bcrypt
from flask import (Flask, render_template, request, url_for, session, redirect, flash, jsonify)

import database

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(32)

db = database.Database('store.db')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/checkuname', methods = ['POST'])
def checkuname():
    uname = request.json['uname']
    if db.get_user(uname): response = False
    else: response = True
    return jsonify({'availability': response})

@app.route('/signin', methods = ['POST'])
def signin():
    uname = request.form.get('uname')
    passwd = request.form.get('passwd')
    entry = db.get_user(uname)
    if entry:
        if bcrypt.checkpw(passwd.encode('utf-8'), entry[0].encode('utf-8')):
            session['uname'] = uname
            session['logged_in'] = True
        else: flash('Wrong password')
    else: flash('Wrong username')
    return redirect(url_for('index'))

@app.route('/signup', methods = ['POST'])
def signup():
    uname = request.form.get('uname')
    passwd = request.form.get('passwd')
    pwd = bcrypt.hashpw(passwd.encode('utf-8'), bcrypt.gensalt())
    success = db.new_user(uname, pwd)
    if not success: flash('Registration failure')
    else:
        session['uname'] = uname
        session['logged_in'] = True
    return redirect(url_for('index'))

@app.route('/signout')
def signout():
    session['uname'] = ''
    session['logged_in'] = False
    return redirect(url_for('index'))

@app.route('/gettasks')
def gettasks():
    if session.get('logged_in'):
        tasks = db.get_tasks(session['uname'])
    else:
        tasks = []
    return jsonify(tasks)

@app.route('/submit', methods = ['POST'])
def submit():
    if session.get('logged_in'):
        data = request.json
        selection = data['sel']
        payload = data['pload']
        if selection == 1:#new task added
            db.save_task(session['uname'], payload['id'], payload['text'])
        elif selection == 2:#task checked/unchecked
            db.checked_task(session['uname'], payload['id'], int(payload['checked']))
        elif selection == 3:#task edited
            db.text_changed(session['uname'], payload['id'], payload['text'])
        elif selection == 4:#task deleted
            db.del_task(session['uname'], payload['id'])
        else:
            print 'error in tasks submission'
    return jsonify({'success': True})

if __name__ == '__main__':
    db.open_db()
    app.run(host = '0.0.0.0', port = 80, debug = True)
    db.close_db()
