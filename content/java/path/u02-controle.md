---
id: java-u02-controle
subject: Java
level: 1
order: 2
title: Chaînes, opérateurs et flux de contrôle
description: String, ++, switch, boucles
language: fr
tags: java, parcours
---
# Chaînes, opérateurs et flux de contrôle

> **Objectif** : manipuler du texte, écrire des conditions et des boucles, sans tomber dans les pièges classiques.

## 1. `String` : immuable, comparée avec `equals`

Comme en JavaScript, une `String` ne change jamais : chaque méthode renvoie une **nouvelle** chaîne.

```java
String s = "java";
String t = s.toUpperCase();   // "JAVA" ; s reste "java"
s.length();                   // 4
s.charAt(0);                  // 'j'
s.substring(1, 3);            // "av" (début inclus, fin exclue)
s.contains("av");             // true
"a,b,c".split(",");           // tableau {"a", "b", "c"}
String.join("-", "a", "b");   // "a-b"
```

La comparaison est le piège numéro un :

```java
String a = "ok";
String b = new String("ok");
System.out.println(a == b);        // false : deux objets différents
System.out.println(a.equals(b));   // true  : même contenu
```

`==` compare les **références**. Les littéraux identiques partagent un même objet (le *pool* de chaînes), ce qui fait parfois marcher `==` par hasard. Ne t'y fie jamais.

## 2. Construire du texte

```java
String nom = "Ada";
String msg = "Bonjour " + nom;                       // concaténation
String f = String.format("%s a %d ans", nom, 36);    // formatage
StringBuilder sb = new StringBuilder();              // dans une boucle
for (int i = 0; i < 3; i++) sb.append(i).append(',');
String r = sb.toString();                            // "0,1,2,"
String json = """
    {"nom": "Ada"}
    """;                                             // bloc de texte (Java 15+)
```

Dans une boucle, utilise `StringBuilder` : chaque `+` sur des `String` crée un nouvel objet.

## 3. Opérateurs

```java
int i = 5;
int a = i++;                       // a = 5, puis i = 6  (post-incrément)
int b = ++i;                       // i = 7, puis b = 7  (pré-incrément)
System.out.println(1 + 2 + "x");   // "3x"
System.out.println("x" + 1 + 2);   // "x12"
System.out.println(7 / 2);         // 3 (division entière)
System.out.println(-7 % 3);        // -1 (le reste suit le signe du dividende)
boolean ok = (a > 0) && (b > 0);   // && et || court-circuitent
String type = (a % 2 == 0) ? "pair" : "impair";   // ternaire
```

## 4. Conditions

```java
if (age >= 18) { ... } else if (age >= 12) { ... } else { ... }

// switch classique : sans break, l'exécution « tombe » dans le cas suivant
switch (n) {
    case 1: System.out.println("un"); break;
    case 2: System.out.println("deux"); break;
    default: System.out.println("autre");
}

// switch expression (Java 14+) : pas de fall-through, retourne une valeur
String jour = switch (n) {
    case 1, 7 -> "week-end";
    case 2, 3, 4, 5, 6 -> "semaine";
    default -> "invalide";
};
```

## 5. Boucles

```java
for (int i = 0; i < 5; i++) {
    if (i == 2) continue;        // passe à l'itération suivante
    if (i == 4) break;           // quitte la boucle
    System.out.println(i);       // affiche 0, 1, 3
}
for (String nom : noms) { ... }  // for-each, comme for...of en JS
while (condition) { ... }
do { ... } while (condition);    // s'exécute au moins une fois
```

## Erreurs fréquentes
- Comparer des `String` avec `==`.
- Oublier `break` dans un `switch` classique.
- Écrire `=` (affectation) au lieu de `==` (comparaison).
- Faire une boucle infinie : la condition ne change jamais.

## À retenir
- `equals()` pour le contenu, `==` pour l'identité.
- `StringBuilder` pour construire du texte en boucle.
- `i++` renvoie puis incrémente, `++i` incrémente puis renvoie.
- Préfère la *switch expression* à `switch` + `break`.

@@ quiz f2-015 easy
::question
Après `String s = "abc"; s.toUpperCase();`, quelle est la valeur de `s` ?
::choices
- [ ] "ABC"
- [x] "abc"
- [ ] null
- [ ] Erreur de compilation
::answer
`"abc"`.
::explanation
Les `String` sont immuables : `toUpperCase()` retourne une **nouvelle** chaîne qu'il faut réaffecter (`s = s.toUpperCase();`).

@@ card str-003 easy
::question
`String`, `StringBuilder`, `StringBuffer` : différences ?
::answer
`String` : **immuable**. `StringBuilder` : mutable, **non** thread-safe, rapide. `StringBuffer` : mutable, méthodes synchronisées (thread-safe, plus lent).
::explanation
Pour concaténer dans une boucle, utiliser `StringBuilder` : chaque `+` sur `String` crée un nouvel objet.

@@ quiz f2-014 easy
::question
Que fait `continue` dans une boucle ?
::choices
- [ ] Quitte la boucle
- [x] Passe à l'itération suivante
- [ ] Quitte la méthode
- [ ] Redémarre la boucle depuis le début
::answer
Il passe directement à l'**itération suivante**.
::explanation
`break` quitte la boucle ; `return` quitte la méthode.

@@ quiz n-streq easy
::question
Comment comparer le **contenu** de deux `String` `a` et `b` ?
::choices
- [ ] a == b
- [x] a.equals(b)
- [ ] a.compare(b)
- [ ] a === b
::answer
`a.equals(b)`.
::explanation
`==` compare les références. `===` n'existe pas en Java.
::hint
Pense à la méthode héritée de `Object`.

@@ quiz n-foreach easy
::question
Quelle boucle est l'équivalent du `for...of` de JavaScript ?
::choices
- [ ] for (int i = 0; i < n; i++)
- [x] for (String s : liste)
- [ ] while (it.hasNext())
- [ ] do { } while (...)
::answer
`for (String s : liste)`.
::explanation
Cette boucle for-each fonctionne sur les tableaux et les `Iterable` (listes, sets…).

@@ quiz n-break easy
::question
Quel mot-clé quitte immédiatement la boucle en cours ?
::choices
- [ ] continue
- [x] break
- [ ] exit
- [ ] stop
::answer
`break`.
::explanation
`continue` passe à l'itération suivante ; `exit` et `stop` n'existent pas comme mots-clés.

@@ card f2-022 medium
::question
Quelle est la sortie de ce code ?

```java
int n = 2;
switch (n) {
    case 1: System.out.print("A");
    case 2: System.out.print("B");
    case 3: System.out.print("C"); break;
    default: System.out.print("D");
}
```
::answer
`BC`
::explanation
Sans `break`, l'exécution continue dans le `case` suivant (*fall-through*) jusqu'au prochain `break`. Les *switch expressions* avec `->` évitent ce piège.
::hint
Que fait l'exécution quand elle ne rencontre pas de `break` ?

@@ card f2-023 medium
::question
Quelle est la sortie de ce code ?

```java
System.out.println("a" + 1 + 2);
System.out.println(1 + 2 + "a");
```
::answer
`a12` puis `3a`
::explanation
L'opérateur `+` s'évalue de gauche à droite : dès qu'un opérande est une `String`, la suite est concaténée. `1 + 2` est d'abord une addition.
::hint
Dès qu'un opérande de `+` est une `String`, tout ce qui suit est concaténé.

@@ card f2-024 hard
::question
Quelle est la sortie de ce code ?

```java
int i = 5;
int j = i++ + ++i;
System.out.println(i + " " + j);
```
::answer
`7 12`
::explanation
`i++` donne 5 puis `i` vaut 6 ; `++i` incrémente d'abord (7) puis donne 7. Donc `j = 5 + 7 = 12`.
::hint
`i++` renvoie l'ancienne valeur, `++i` la nouvelle.

@@ exercise e-fizz medium FizzBuzz
::question
Pour les nombres de 1 à 15 : affiche `Fizz` si multiple de 3, `Buzz` si multiple de 5, `FizzBuzz` si les deux, sinon le nombre. Un résultat par ligne.
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
        for (int i = 1; i <= 15; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else System.out.println(i);
        }
    }
}
```
::expected
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```
::checks
- Teste d'abord le multiple de 15
- Utilise l'opérateur %
::hint
Le cas « les deux » doit être testé en premier.
---
`i % 3 == 0` teste un multiple de 3.

@@ exercise e-voyelles medium Compter les voyelles
::question
Compte les voyelles (`a e i o u`) de `"programmation"` et affiche `Voyelles : N`.
::starter
```java
public class Main {
    public static void main(String[] args) {
        String mot = "programmation";
        // TODO
    }
}
```
::solution
```java
public class Main {
    public static void main(String[] args) {
        String mot = "programmation";
        int n = 0;
        for (char c : mot.toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) n++;
        }
        System.out.println("Voyelles : " + n);
    }
}
```
::expected
```
Voyelles : 5
```
::checks
- Parcours les caractères avec for-each
- Pas de == pour comparer des chaînes
::hint
`mot.toCharArray()` donne un `char[]` à parcourir.
---
`"aeiou".indexOf(c) >= 0` teste l'appartenance.
