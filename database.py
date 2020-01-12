import sqlite3

class Database(object):
    def __init__(self, dbname):
        self.dbname = dbname

    def open_db(self):
        self.dbworker = sqlite3.connect(self.dbname, check_same_thread = False)
        self.cursor = self.dbworker.cursor()

    def close_db(self):
        self.dbworker.close()

    def new_user(self, uname, passwd):
        command1 = 'INSERT INTO accounts(Username, Password) VALUES(?, ?)'
        command2 = 'CREATE TABLE {}(ID INTEGER PRIMARY KEY, Task TEXT, Checked INTEGER)'.format(uname)
        values = (uname, passwd)
        try: self.cursor.execute(command1, values)
        except sqlite3.IntegrityError: return False
        else:
            self.cursor.execute(command2)
            self.dbworker.commit()
            return True

    def get_user(self, uname):
        command = 'SELECT Password FROM accounts WHERE Username = ?'
        self.cursor.execute(command, (uname, ))
        return self.cursor.fetchone()

    def save_task(self, uname, tid, text):
        command = 'INSERT INTO {}(ID, Task, Checked) VALUES(?, ?, ?)'.format(uname)
        values = (tid, text, 0)
        self.cursor.execute(command, values)
        self.dbworker.commit()

    def checked_task(self, uname, tid, check):
        command = 'UPDATE {} SET Checked = ? WHERE ID = ?'.format(uname)
        values = (check, tid)
        self.cursor.execute(command, values)
        self.dbworker.commit()

    def text_changed(self, uname, tid, text):
        command = 'UPDATE {} SET Task = ? WHERE ID = ?'.format(uname)
        values = (text, tid)
        self.cursor.execute(command, values)
        self.dbworker.commit()

    def del_task(self, uname, tid):
        command = 'DELETE FROM {} WHERE ID = ?'.format(uname)
        self.cursor.execute(command, (tid, ))
        self.dbworker.commit()

    def get_tasks(self, uname):
        data = []
        command = 'SELECT * FROM {}'.format(uname)
        self.cursor.execute(command)
        for row in self.cursor:
            data.append({'id': row[0], 'text': row[1], 'checked': bool(row[2])})
        return data
