---
id: java-u04-classes
subject: Java
level: 1
order: 4
title: Classes et objets
description: Champs, constructeurs, visibilité, static, final, equals
language: fr
tags: java, parcours
---
# Classes et objets

> **Objectif** : modéliser des données avec des classes, protéger leur état et comprendre `static`, `final` et `equals`.

## 1. Une classe, un objet

Une **classe** est un plan ; un **objet** est une instance créée avec `new`. En TypeScript : `class Compte { private solde: number; ... }`, la structure est très proche.

```java
public class Personne {
    private final String nom;            // champ d'instance, fixé à la construction
    private int age;
    private static int compteur = 0;     // champ de classe : un seul exemplaire partagé

    public Personne(String nom, int age) {   // constructeur
        this.nom = nom;                      // this = l'objet en cours de construction
        this.age = age;
        compteur++;
    }
    public Personne(String nom) { this(nom, 0); }   // un constructeur peut en appeler un autre

    public String getNom() { return nom; }
    public int getAge() { return age; }
    public void vieillir() { age++; }
    public static int getCompteur() { return compteur; }

    @Override
    public String toString() { return nom + " (" + age + " ans)"; }
}

Personne ada = new Personne("Ada", 36);
ada.vieillir();
System.out.println(ada);                     // Ada (37 ans)
System.out.println(Personne.getCompteur());  // 1
```

Si tu n'écris aucun constructeur, Java en génère un par défaut (sans argument).

## 2. Encapsulation et visibilité

Garde les champs `private` et expose ce qui est utile avec des méthodes : tu peux ensuite valider les valeurs ou changer la représentation interne sans casser les appelants.

| Modificateur | Visible depuis |
|---|---|
| `private` | la classe seule |
| *(aucun)* | le même package |
| `protected` | le package et les sous-classes |
| `public` | partout |

## 3. `static` et `final`

- `static` : appartient à la **classe**, pas à une instance (champ, méthode, bloc). Une méthode `static` ne peut pas utiliser `this`.
- `final` sur une variable : on ne peut plus la **réaffecter**. Sur un objet, la référence est figée mais son contenu peut changer.
- `final` sur une méthode : non redéfinissable. Sur une classe : non héritable.

```java
final List<String> l = new ArrayList<>();
l.add("x");              // OK : le contenu change
// l = new ArrayList<>(); // erreur : la référence est finale
```

## 4. `==` et `equals`

Toute classe hérite de `Object` : `toString()`, `equals()`, `hashCode()`.

```java
Personne a = new Personne("Ada", 36);
Personne b = new Personne("Ada", 36);
System.out.println(a == b);        // false : deux objets distincts
System.out.println(a.equals(b));   // false aussi tant qu'on n'a pas redéfini equals
```

`==` compare les références. `equals()` compare l'égalité logique, mais seulement si la classe la redéfinit (voir l'unité sur l'égalité).

## 5. Packages

```java
package com.exemple.app;        // première ligne du fichier
import java.util.List;          // pour utiliser une classe d'un autre package
```

## Erreurs fréquentes
- Mettre tous les champs `public`.
- Oublier `this` quand le paramètre a le même nom que le champ : `nom = nom;` ne fait rien.
- Appeler une méthode d'instance depuis `static` sans objet.
- Penser que `final` rend l'objet immuable.

## À retenir
- `new` crée l'objet et appelle le constructeur ; la variable contient une **référence**.
- Champs `private`, accès via méthodes.
- `static` = partagé par la classe ; `final` = non réaffectable.
- `==` compare les références, `equals()` le contenu logique.

@@ card f2-029 easy
::question
Variable d'instance, variable de classe (`static`) et variable locale : quelles différences ?
::answer
**Instance** : un exemplaire par objet, valeur par défaut, vit tant que l'objet vit. **Classe (`static`)** : un seul exemplaire partagé par toutes les instances, chargé avec la classe. **Locale** : déclarée dans une méthode ou un bloc, vit sur la *stack*, **sans valeur par défaut** (doit être initialisée).

@@ quiz f2-009 easy
::question
Lesquelles de ces méthodes sont définies dans `java.lang.Object` ?
::choices
- [x] toString()
- [x] equals(Object)
- [ ] compareTo(Object)
- [x] hashCode()
::answer
`toString()`, `equals()` et `hashCode()`.
::explanation
`compareTo` appartient à l'interface `Comparable`. `Object` définit aussi `getClass()`, `wait()`, `notify()`…

@@ card eq-001 easy
::question
Quelle différence entre `==` et `equals()` ?
::answer
`==` compare les **références** (ou les valeurs pour les primitifs). `equals()` compare l'égalité logique, si la classe la redéfinit.
::explanation
`Object.equals()` par défaut se comporte comme `==`.

@@ quiz n-this easy
::question
Que représente `this` dans un constructeur ?
::choices
- [ ] La classe parente
- [x] L'objet en cours de construction
- [ ] Un nouvel objet
- [ ] Le garbage collector
::answer
L'objet en cours de construction (l'instance courante).
::explanation
On l'utilise surtout pour lever l'ambiguïté : `this.nom = nom;`.

@@ quiz n-encap easy
::question
Pourquoi déclarer un champ `private` avec un accesseur ?
::choices
- [ ] Pour que le compilateur optimise
- [x] Pour contrôler l'accès (encapsulation)
- [ ] Pour le rendre static
- [ ] C'est obligatoire en Java
::answer
Pour contrôler l'accès : c'est l'encapsulation.
::explanation
On peut valider les valeurs, changer la représentation interne ou rendre le champ en lecture seule.

@@ card n-new easy
::question
À quoi sert le mot-clé `new` ?
::answer
Il alloue un objet sur la **heap**, appelle son constructeur et retourne une référence vers cet objet.
::explanation
`Compte c = new Compte(100);` : `c` contient la référence, pas l'objet lui-même.

@@ card oop-004 medium
::question
Quand le compilateur génère-t-il un constructeur par défaut, et que fait `super()` ?
::answer
Uniquement si la classe ne déclare **aucun** constructeur. Tout constructeur commence par un appel implicite à `super()` (sans argument) si aucun `this(...)`/`super(...)` explicite n'est écrit.
::explanation
Si le parent n'a pas de constructeur sans argument, la sous-classe doit appeler explicitement `super(...)`, sinon erreur de compilation.

@@ quiz f2-006 medium
::question
Quel modificateur d'accès rend un membre visible dans son package **et** dans les sous-classes d'autres packages, mais pas partout ?
::choices
- [ ] private
- [ ] (sans modificateur)
- [x] protected
- [ ] public
::answer
`protected`.
::explanation
`private` : la classe seule. Sans modificateur : le package. `public` : partout.

@@ quiz f2-007 medium
::question
Lesquels peuvent être déclarés `static` ?
::choices
- [x] Une méthode
- [x] Un champ
- [x] Un bloc d'initialisation
- [ ] Un constructeur
::answer
Une méthode, un champ et un bloc d'initialisation.
::explanation
Un constructeur ne peut pas être `static` : il initialise une instance.

@@ quiz f2-008 medium
::question
Que se passe-t-il avec ce code ?

```java
final List<String> l = new ArrayList<>();
l.add("x");
```
::choices
- [x] Il compile et s'exécute
- [ ] Erreur de compilation : final interdit toute modification
- [ ] UnsupportedOperationException à l'exécution
::answer
Il compile et s'exécute : `final` rend la **référence** constante, pas le contenu de l'objet.
::explanation
Pour une liste réellement immuable, utiliser `List.of(...)`.
::hint
`final` s'applique à la variable, pas à l'objet pointé.

@@ exercise e-rect medium Classe Rectangle
::question
Écris la classe `Rectangle` : champs privés `largeur` et `hauteur`, constructeur, méthode `aire()` et `toString()` qui retourne `Rectangle[3x4]`.
::starter
```java
class Rectangle {
    // TODO : champs privés, constructeur, aire(), toString()
}

public class Main {
    public static void main(String[] args) {
        Rectangle r = new Rectangle(3, 4);
        System.out.println(r);
        System.out.println(r.aire());
    }
}
```
::solution
```java
class Rectangle {
    private final int largeur;
    private final int hauteur;

    Rectangle(int largeur, int hauteur) {
        this.largeur = largeur;
        this.hauteur = hauteur;
    }

    int aire() { return largeur * hauteur; }

    @Override
    public String toString() { return "Rectangle[" + largeur + "x" + hauteur + "]"; }
}

public class Main {
    public static void main(String[] args) {
        Rectangle r = new Rectangle(3, 4);
        System.out.println(r);
        System.out.println(r.aire());
    }
}
```
::expected
```
Rectangle[3x4]
12
```
::checks
- Champs private
- Constructeur avec this
- toString redéfini avec @Override
::hint
`println(r)` appelle `r.toString()`.
---
Dans le constructeur : `this.largeur = largeur;`.
