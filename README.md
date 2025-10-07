## Issues
### Fix for module not found
typo in files or folders, ref project gudie

### Fix for localhost:5000 psuedo-start
Issue: port 5000 is being used already by another service
Solution: change port to 3001

- Update backend
`nvim server.js`
change 5000 to 3001

- Update frontend
`nvim App.js`
change 5000 to 3001
