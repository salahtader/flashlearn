---
id: modele-mon-cours
subject: Java
level: 1
order: 99
title: Titre de l'unité
description: Une phrase qui résume l'unité
language: fr
tags: java, modele
---
# Titre de la leçon

Tout ce qui précède la première directive est la **leçon** (Markdown : titres, listes, tableaux, blocs de code).

```java
System.out.println("Bonjour");
```

## Format (à supprimer ou adapter)
- En-tête obligatoire : `id`, `subject`, `title`. Optionnels : `level` (1-3), `order` (position dans la matière), `description`, `tags` (séparés par des virgules).
- Trois types de blocs : `card`, `quiz`, `exercise`. Syntaxe : `@@ type identifiant [easy|medium|hard] [titre]`.
- Chaque bloc contient des sections `::nom`. Les lignes `@@` et `::` placées dans un bloc de code ``` sont ignorées.

@@ card c1 easy
::question
Question de la carte (Markdown, code autorisé).
::answer
Réponse attendue.
::explanation
Explication facultative.
::hint
Indice facultatif.

@@ quiz q1 medium
::question
Quelle est la bonne réponse ?
::choices
- [ ] Mauvais choix
- [x] Bon choix
- [ ] Autre mauvais choix
::explanation
Pourquoi c'est la bonne réponse. Plusieurs `[x]` = plusieurs bonnes réponses.
::hint
Indice facultatif.

@@ exercise e1 easy Afficher un message
::question
Écris un programme qui affiche `Bonjour`.
::starter
```java
public class Main {
    public static void main(String[] args) {
        // TODO
    }
}
```
::solution
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}
```
::expected
```
Bonjour
```
::checks
- Le programme compile
- Il affiche exactement Bonjour
::hint
Utilise System.out.println.
---
Une chaîne s'écrit entre guillemets doubles.
::explanation
`System.out.println` affiche le texte puis passe à la ligne.
