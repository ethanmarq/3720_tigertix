const sqlite3 = require('sqlite3').verbose();
const adminModel = require('../adminModel');

describe('Admin Model - addEvent', () => {
  let testDb;

  beforeEach((done) => {
    testDb = new sqlite3.Database(':memory:', (err) => {
      if (err) return done(err);
      
      testDb.run(`
        CREATE TABLE events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          tickets INTEGER NOT NULL
        )
      `, (err) => {
        if (err) return done(err);
        adminModel.setDatabase(testDb);
        done();
      });
    });
  });

  afterEach((done) => {
    // Properly close database to avoid NAPI errors
    if (testDb) {
      testDb.close((err) => {
        testDb = null;
        done(err);
      });
    } else {
      done();
    }
  });

  test('should insert a new event into the database', (done) => {
    const newEvent = { name: 'Jest Test Event', date: '2025-12-31', tickets: 50 };

    adminModel.addEvent(newEvent, (err, result) => {
      if (err) {
        done(err);
        return;
      }

      try {
        expect(err).toBeNull();
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(1);
        expect(result.name).toBe('Jest Test Event');
        expect(result.date).toBe('2025-12-31');
        expect(result.tickets).toBe(50);

        // Verify data was actually inserted
        testDb.get('SELECT * FROM events WHERE id = ?', [1], (err, row) => {
          if (err) {
            done(err);
            return;
          }
          
          expect(row).toBeDefined();
          expect(row.name).toBe('Jest Test Event');
          done();
        });
      } catch (error) {
        done(error);
      }
    });
  });
});
