# wb0

wb0 is the simplest online collaborative whiteboard focusing on communication with diagrams

![screenshot](https://user-images.githubusercontent.com/692124/119272746-cb81b380-bc07-11eb-825f-c41e9abba368.png)

This board is derived from the
[rdbeach/wb](https://github.com/rdbeach/wb) version of the
[lovasoa/whitebophir](https://github.com/lovasoa/whitebophir) project.
Thanks to all this vibrant community!

Start it with:

```
PORT=8080 npm start
```

If you want to run on a different port, you will need to change the PORT=8080 in the line above, and modify this line in /client-data/js/board.js:

```
this.socket = io.connect(':8080', {
```

By default, the application runs its own web server and socket server at the root directory, listening to port 8080. If you want to incorporate the whiteboard in an existing site, simply move the client-data directory to a subfolder of your site and point your browser toward the index.html or board.html file located within this directory.


If you want to run the board from an https site. You will need to update the following paths in /server/configuration.js

```
    PRIVATE_KEY_PATH:  "../../../../ssl/private.key",

    CERTIFICATE_PATH: "../../../../ssl/certificate.crt",

    CA_BUNDLE_PATH: "../../../../ssl/ca_bundle.crt",
```

And start the server with:

```
PORT=8080 HTTPS=true npm start
```
