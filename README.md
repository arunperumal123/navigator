# navigator



Setup client & server (PC version)
----------------------------------

 1. Download code base through GIT
      https://github.com/arunperumal123/navigator

 2. Install mongodb for Linux  (use apt-get) or download source/compile install
      sudo apt-get install mongodb

 3. Install mongodb (3.0.x), git, python server,robomongo (optional) for windows.
 
 4.  Import EPG data to mongodb through following command (for windows PC, please ignore --jsonArray option)
       mongoimport --db CloudDB --collection rovi --type json --file DB4_rovi.json --jsonArray

 5. Update Node packages for client
        cd client
        npm install

 6. Update Node packages for server
         cd server
         npm install

 7. Update bower packages for client
        cd client
         bower install.

 8.  Install Gulp in client
          cd client
          npm install -g gulp.

 9. Run Gulp on client
           cd client
            gulp  ( This will push any modified changes to dist folder. Dist contains the release code, used by client)

  
10. Run the server side code as follows
                  cloud-search/neo/server/bin$ node www.js


11.  Run , client side python local server
                python -m SimpleHTTPServer 5000  (linux)
                python -m http.server 5000 (windows)

12. Verify your server is running properly , by checking in browser
             localhost:8080

13.  Launch client as follows.
             localhost:5000

