# Analyse détaillée du Dashboard Administrateur – Laverie Pro

## 1. Objectif du dashboard administrateur

Le dashboard administrateur constitue le centre de gestion de **Laverie Pro**. Il permet à l'administrateur de gérer les réservations des clients, de superviser les stations de service, de suivre l'activité de la laverie et de consulter les statistiques essentielles de l'entreprise.

Il centralise toutes les informations nécessaires au bon fonctionnement de la plateforme.

---

## 2. Les indicateurs du tableau de bord

### a) Réservations globales

Cet indicateur affiche le **nombre total des réservations effectuées par les clients**.

Il prend en compte :

* les réservations en attente de validation ;
* les réservations validées par l'administrateur.

Chaque nouvelle demande de réservation augmente automatiquement ce compteur.

---

### b) Lavages terminés

Cet indicateur représente le **nombre total des lavages réellement effectués**.

Une réservation est considérée comme un lavage terminé lorsque :

1. le client effectue une réservation ;
2. l'administrateur valide cette réservation ;
3. le client réalise effectivement son lavage ;
4. le client confirme que le lavage a été effectué.

C'est uniquement après cette confirmation que le compteur est mis à jour.

---

### c) Revenus totaux

Les revenus totaux correspondent à la **somme des montants générés par tous les lavages terminés**.

Les réservations en attente ou refusées ne sont pas prises en compte dans ce calcul.

---

### d) Clients

Cet indicateur affiche le **nombre de clients ayant effectivement réalisé un lavage**.

Seuls les clients ayant terminé le processus jusqu'à la confirmation du lavage sont comptabilisés.

---

## 3. Gestion des réservations

Lorsqu'un client effectue une réservation, celle-ci est automatiquement enregistrée dans le système avec le statut **En attente**.

Elle apparaît immédiatement dans le tableau de bord de l'administrateur, qui peut consulter :

* les informations du client ;
* la station sélectionnée ;
* la date et l'heure prévues ;
* le montant ;
* le statut de la réservation.

L'administrateur peut ensuite accepter ou refuser la demande.

---

## 4. Gestion des stations de service

Le système contrôle automatiquement la disponibilité des stations afin d'éviter les conflits de réservation.

Par exemple, si une station possède une capacité de **3 places** et que **2 sont déjà occupées**, il ne reste qu'une seule place disponible.

Si deux clients effectuent une demande presque simultanément, la réservation est attribuée selon le principe du **premier arrivé, premier servi**.

Le premier client obtient la dernière place disponible et la station passe immédiatement à **complète**. Toute demande suivante pour cette même station est automatiquement bloquée ou signalée comme indisponible.

Cette logique garantit qu'aucune station ne dépasse sa capacité.

---

## 5. Confirmation du lavage

Après avoir bénéficié du service, le client confirme que le lavage a bien été réalisé.

Cette action entraîne automatiquement :

* l'incrémentation du compteur **Lavages terminés** ;
* l'ajout du montant correspondant aux **Revenus totaux** ;
* la prise en compte du client dans la statistique **Clients**.

---

## 6. Gestion des témoignages

Les témoignages représentent les avis authentiques des clients sur la qualité du service.

Afin d'assurer leur fiabilité, **seuls les clients ayant confirmé un lavage terminé peuvent publier un témoignage**.

Ainsi, tous les avis affichés sur la plateforme proviennent de clients ayant réellement utilisé les services de la laverie.

---

## 7. Flux global de fonctionnement

Le processus suit les étapes suivantes :

1. Le client sélectionne une station disponible.
2. Il effectue une réservation.
3. La réservation apparaît dans le tableau de bord administrateur avec le statut **En attente**.
4. L'administrateur accepte ou refuse la demande.
5. Si elle est acceptée, le client réalise son lavage.
6. Le client confirme que le lavage est terminé.
7. Le système met automatiquement à jour les statistiques (**Lavages terminés**, **Revenus totaux** et **Clients**).
8. Le client peut ensuite publier un témoignage qui sera visible sur la plateforme comme un avis réel.
