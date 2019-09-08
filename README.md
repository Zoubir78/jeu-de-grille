# Jeu de Grille
Un jeu multijoueur en temps réel simple et amusant dans lequel vous contrôlez des carreaux sur une grille. Poussez les tuiles des autres joueurs et entourez-les pour les capturer. Combattez pour contrôler le plus grand nombre de tuiles.

Il y a une seule page frontale qui affiche la grille et l'activité du jeu avec un canevas HTML. Les déplacements sont envoyés via Socket.IO au backend de Node.js où ils sont traités. Les changements d'état du plateau sont ensuite diffusés à tous les joueurs de cette grille. Plusieurs jeux peuvent avoir lieu simultanément avec le matchmaking. Des jeux personnalisés avec différentes tailles et publicités peuvent être créés.

Ceci a été créé principalement comme exercice d'apprentissage dans Node.js, Socket.IO et les pratiques JavaScript générales.

Connectez-vous au serveur de test hébergé sur Heroku ici: https://jeu-de-grille.herokuapp.com
