## Was ist das? ##

Eine ganz einfache NODE.JS Anwendung welche die folgenden Bibliotheken verwendet:

* http://chessboardjs.com/ - Zur grafischen Darstellung eines Schachbretts
* https://github.com/jhlywa/chess.js - Um die Gültigkeit eines Zugs auf dem Schachbrett sicher zustellen sowie Mattstellungen usw. zu erkennen
* https://github.com/imor/uci - Damit kann man aus NODE.JS mit einer Schach-Engine kommunizieren und z.B. den besten Zug berechnen Lassen.
* NODE.JS - Iss klar
* https://github.com/sockjs/sockjs-node - Das ist eine Bibliothek um Socket-Artige Verbindunge via HTTP aufzubauen. Damit spricht der NODE.JS Server mit dem JS-Client und andersrum

## Warum ? ##

Ganz einfach:

1. Sowas gibts noch nicht als Open-Source und ich habe weder Lust noch Geld mir bei irgend einem Anbieter einen Premium-Schach-Account anzulegen.
2. Spielt man Online gegen einen Computer ist meist die Rechenkraft begrenzt. Hiermit kann man richtig starke, UCI-Engines (z.B. Stockfish) hinter einen Monster-Server klemmen und von überall spielen. Lasse ich außerdem Stockfisch 64 mit maximalen Einstellungen auf meinem Laptop laufen, reagiert irgendwann nichts mehr. Jedoch steht hier eine ziemlich fette Maschine rum, die ich damit auch nebenbei auslasten kann.  

## Wie kann ich es starten / spielen? ##

``git clone git@bitbucket.org:dawjdh/nodechess.git``

``git clone git@bitbucket.org:dawjdh/nodechess.git``