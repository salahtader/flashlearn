---
id: java-u03-methodes
subject: Java
level: 1
order: 3
title: Méthodes, tableaux et premières erreurs
description: Passage par valeur, tableaux, null, try/catch
language: fr
tags: java, parcours
---
# Méthodes, tableaux et premières erreurs

> **Objectif** : écrire des méthodes, manipuler des tableaux et comprendre ce qui se passe quand ça plante.

## 1. Méthodes

Une méthode déclare son type de retour (`void` si elle ne retourne rien) et le type de chaque paramètre.

```java
static int somme(int a, int b) { return a + b; }

static double somme(double a, double b) { return a + b; }   // surcharge : mêmes noms, paramètres différents

static int total(int... valeurs) {                          // varargs : valeurs est un int[]
    int t = 0;
    for (int v : valeurs) t += v;
    return t;
}
// total(), total(1), total(1, 2, 3) sont valides
```

Le point d'entrée d'un programme est :

```java
public static void main(String[] args) { ... }
```

## 2. Java passe toujours par valeur

Une méthode reçoit une **copie** de chaque argument. Pour un objet ou un tableau, ce qui est copié est la **référence** : la méthode peut modifier le contenu partagé, mais pas faire pointer ta variable ailleurs.

```java
static void modifier(int[] t, int n) {
    t[0] = 99;   // modifie le tableau partagé
    n = 99;      // ne modifie que la copie locale
}

int[] tab = {1};
int x = 1;
modifier(tab, x);
// tab[0] vaut 99, x vaut toujours 1
```

## 3. Tableaux

Taille **fixe** (contrairement aux tableaux JavaScript).

```java
int[] a = new int[3];            // {0, 0, 0}
int[] b = {3, 1, 2};
b[0] = 10;
System.out.println(b.length);            // 3 : un champ, sans parenthèses
System.out.println(Arrays.toString(b));  // [10, 1, 2]
Arrays.sort(b);                          // trie en place
int[][] grille = new int[2][3];          // tableau à 2 dimensions
```

`System.out.println(b)` n'affiche pas le contenu mais un identifiant du type `[I@6d06d69c`. Utilise `Arrays.toString`. La classe `Arrays` offre aussi `copyOf`, `fill`, `equals`.

## 4. `null` et exceptions

Une référence peut valoir `null`. Appeler une méthode dessus lève une `NullPointerException`. Il n'y a pas d'`undefined` en Java.

```java
String s = null;
s.length();                      // NullPointerException

try {
    int[] t = new int[2];
    t[2] = 1;                    // index valides : 0 et 1
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Erreur : " + e.getMessage());   // Index 2 out of bounds for length 2
} finally {
    System.out.println("toujours exécuté");
}
```

Une exception non capturée remonte la pile d'appels et arrête le programme avec une *stack trace* : lis-la de haut en bas, la première ligne de **ton** code indique où chercher.

## Erreurs fréquentes
- Croire que modifier le paramètre `n` change la variable de l'appelant.
- Accéder à `t[t.length]` : le dernier index est `t.length - 1`.
- Afficher un tableau directement.
- Appeler une méthode sur une variable jamais initialisée (`null`).

## À retenir
- Passage par valeur : pour un objet, la valeur copiée est la référence.
- Un tableau a une taille fixe : `t.length`, sans parenthèses.
- `ArrayIndexOutOfBoundsException` et `NullPointerException` sont les deux erreurs de débutant.
- `try` / `catch` / `finally` : `finally` s'exécute toujours.

@@ quiz f2-010 easy
::question
Comment obtient-on la taille d'un tableau `t` ?
::choices
- [x] t.length
- [ ] t.length()
- [ ] t.size()
- [ ] t.getLength()
::answer
`t.length` (un champ, sans parenthèses).
::explanation
`String.length()` est une méthode, `List.size()` aussi : trois syntaxes différentes.

@@ quiz f2-011 easy
::question
Quelle exception est levée par `s.length()` quand `String s = null;` ?
::choices
- [x] NullPointerException
- [ ] IllegalArgumentException
- [ ] ArithmeticException
- [ ] ClassCastException
::answer
`NullPointerException`.
::explanation
Appeler une méthode ou lire un champ sur une référence `null` lève toujours une NPE.

@@ quiz n-aioobe easy
::question
Quelle exception est levée par `t[5]` si `t` contient 3 éléments ?
::choices
- [ ] NullPointerException
- [x] ArrayIndexOutOfBoundsException
- [ ] IllegalStateException
- [ ] NumberFormatException
::answer
`ArrayIndexOutOfBoundsException`.
::explanation
Les index valides vont de 0 à `t.length - 1`.

@@ quiz n-void easy
::question
Que signifie `void` dans la signature d'une méthode ?
::choices
- [ ] Elle retourne null
- [x] Elle ne retourne aucune valeur
- [ ] Elle est vide
- [ ] Elle n'a pas de paramètres
::answer
Elle ne retourne aucune valeur.
::explanation
Une méthode `void` peut quand même avoir des paramètres et effectuer des actions.

@@ quiz n-main easy
::question
Quelle est la signature du point d'entrée classique d'un programme Java ?
::choices
- [ ] public void main()
- [x] public static void main(String[] args)
- [ ] static main()
- [ ] void start()
::answer
`public static void main(String[] args)`.
::explanation
`static` : la JVM l'appelle sans créer d'objet. Depuis Java 21, une forme simplifiée est possible en préversion.

@@ quiz f2-018 medium
::question
Quels appels sont valides pour `void f(int... xs)` ?
::choices
- [x] f()
- [x] f(1)
- [x] f(1, 2, 3)
- [x] f(new int[]{1, 2})
::answer
Tous.
::explanation
Les *varargs* sont reçus comme un tableau `int[]` ; sans argument, le tableau est vide. Le paramètre varargs doit être le dernier.

@@ card f2-027 medium
::question
Quelle est la sortie de ce code ?

```java
try {
    int[] t = new int[2];
    t[2] = 1;
    System.out.print("A");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.print("B");
} finally {
    System.out.print("C");
}
```
::answer
`BC`
::explanation
`t[2]` est hors limites (taille 2) : le `catch` affiche `B`, puis le `finally` affiche `C`. Le `A` n'est jamais atteint.
::hint
Quelle est la taille du tableau, et quel index est invalide ?

@@ card f2-026 hard
::question
Quelle est la sortie de ce code ?

```java
static void change(int[] t, int v) { t[0] = 99; v = 99; }

int[] arr = {1};
int val = 1;
change(arr, val);
System.out.println(arr[0] + " " + val);
```
::answer
`99 1`
::explanation
Java passe **toujours par valeur** : pour un objet, la valeur copiée est la référence. `t[0] = 99` modifie le tableau partagé ; `v = 99` ne change que la copie locale.
::hint
Java copie toujours la valeur. Pour un tableau, que vaut cette valeur ?

@@ exercise e-somme easy Somme et maximum d'un tableau
::question
Avec `int[] t = {4, 8, 15, 16, 23, 42};`, affiche `Somme = ...` puis `Max = ...`.
::starter
```java
public class Main {
    public static void main(String[] args) {
        int[] t = {4, 8, 15, 16, 23, 42};
        // TODO
    }
}
```
::solution
```java
public class Main {
    public static void main(String[] args) {
        int[] t = {4, 8, 15, 16, 23, 42};
        int somme = 0;
        int max = t[0];
        for (int v : t) {
            somme += v;
            if (v > max) max = v;
        }
        System.out.println("Somme = " + somme);
        System.out.println("Max = " + max);
    }
}
```
::expected
```
Somme = 108
Max = 42
```
::checks
- Une seule boucle suffit
- Initialise max avec t[0]
::hint
Parcours avec `for (int v : t)`.
---
Ne démarre pas `max` à 0 si le tableau peut contenir des négatifs.

@@ exercise e-premier medium Nombres premiers
::question
Complète la méthode `estPremier` : le programme doit afficher les nombres premiers de 2 à 20, un par ligne.
::starter
```java
public class Main {
    static boolean estPremier(int n) {
        // TODO
        return false;
    }

    public static void main(String[] args) {
        for (int n = 2; n <= 20; n++) {
            if (estPremier(n)) System.out.println(n);
        }
    }
}
```
::solution
```java
public class Main {
    static boolean estPremier(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        for (int n = 2; n <= 20; n++) {
            if (estPremier(n)) System.out.println(n);
        }
    }
}
```
::expected
```
2
3
5
7
11
13
17
19
```
::checks
- Teste les diviseurs jusqu'à la racine de n
- Retourne false dès qu'un diviseur est trouvé
::hint
Un nombre est premier s'il n'a aucun diviseur entre 2 et √n.
---
Boucle `for (int d = 2; d * d <= n; d++)`.
