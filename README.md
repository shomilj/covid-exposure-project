# COVID Exposure Project

### INTRODUCTION
On college campuses, people have a small set of well-defined people who they're meeting with (in person). However, those people are also meeting with other people – and the social bubbles aren't always completely closed.

This project aims to measure your exposure based on the people around you; in other words, we want you to be able to see a rough approxmation of how many second/third/fourth-degree connections you *may* be exposed to.

---
### HOW IT WORKS
Each user is assigned two values: a `private key` and a `public key`.

Users share their `public key` with their immediate first-degree connections/friends through a unique URL.

When an individual recieves a `public key`, they're given an opportunity to either create an account or sign in to an existing account using their public/private key pair.

Then, they establish a `first-degree connection` by entering their friend's `public key`.

---

### THE GRAPH

At any point in time, you can find yourself using your `public key/private key pair` on the exposure graph, a global network of all individuals associated with this project.

---

### PRIVACY

No personally-identifiable information is ever collected in this process. Because of this, no single person can identify anybody on the graph outside of who they've directly sent their public key to. 

### SECURITY

To prevent abuse, we've built in strict rate-limiting and anti-DDOS protection. 

---