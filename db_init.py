import sqlite3

dbname = 'store.db'
worker = sqlite3.connect(dbname)
cursor = worker.cursor()
cursor.execute('CREATE TABLE accounts(Username TEXT PRIMARY KEY, Password TEXT)')
worker.commit()
worker.close()
