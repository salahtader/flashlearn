---
id: java-u01-types
subject: Java
level: 1
order: 1
title: Types et variables
description: Primitifs, conversions, valeurs par défaut
language: fr
tags: java, parcours
---
# Types et variables

> **Objectif** : déclarer des variables, choisir le bon type et éviter les pièges de conversion.

## 1. Java est typé statiquement

En TypeScript, les types disparaissent à la compilation. En Java, chaque variable a un type **déclaré**, vérifié par le compilateur, et la JVM s'en sert à l'exécution. Le type s'écrit **avant** le nom, et chaque instruction finit par `;`.

| TypeScript | Java |
|---|---|
| `let n: number = 3` | `int n = 3;` |
| `let p: number = 9.99` | `double p = 9.99;` |
| `const s: string = "a"` | `final String s = "a";` |
| `let ok: boolean = true` | `boolean ok = true;` |

## 2. Les 8 types primitifs

| Type | Taille | Exemple | Usage |
|---|---|---|---|
| `byte` | 8 bits | `byte b = 100;` | octets, flux binaires |
| `short` | 16 bits | `short s = 3000;` | rare |
| `int` | 32 bits | `int n = 42;` | **entier par défaut** (≈ ±2,1 milliards) |
| `long` | 64 bits | `long l = 10L;` | grands entiers |
| `float` | 32 bits | `float f = 1.5f;` | décimal simple précision |
| `double` | 64 bits | `double d = 1.5;` | **décimal par défaut** |
| `char` | 16 bits | `char c = 'A';` | un caractère |
| `boolean` | 1 valeur | `boolean ok = true;` | `true` ou `false` |

```java
int age = 30;
long population = 8_100_000_000L;   // suffixe L ; les _ sont autorisés
double prix = 9.99;
float ratio = 0.5f;                  // suffixe f obligatoire
char lettre = 'J';                   // guillemets simples = un seul caractère
boolean actif = true;
String nom = "Ada";                  // String (majuscule) est une classe, pas un primitif
```

## 3. Conversions : élargir est gratuit, rétrécir demande un cast

```java
int i = 10;
long l = i;           // OK : élargissement implicite
double d = i;         // OK
int j = (int) 3.9;    // cast : j vaut 3 (troncature, pas d'arrondi)
// int k = 3.9;       // ne compile pas : perte de précision
// float f = 1.5;     // ne compile pas : 1.5 est un double
```

> **Piège** : `(int) 3.9` donne `3`, pas `4`. Pour arrondir, utilise `Math.round(3.9)`.

## 4. Débordement et précision

Les entiers ne lèvent pas d'erreur quand ils dépassent leur plage : ils « font le tour ».

```java
int max = Integer.MAX_VALUE;        // 2147483647
System.out.println(max + 1);        // -2147483648 : débordement silencieux
Math.addExact(max, 1);              // lève ArithmeticException : à préférer si ça compte
```

Les décimaux (`double`, `float`) sont approchés en binaire :

```java
System.out.println(0.1 + 0.2);                                          // 0.30000000000000004
System.out.println(new BigDecimal("0.1").add(new BigDecimal("0.2")));   // 0.3
```

Pour l'argent, utilise `BigDecimal` (construit à partir d'une `String`) ou un `long` en centimes.

## 5. Valeurs par défaut et `var`

Les **champs** d'une classe reçoivent une valeur par défaut (`0`, `false`, `null`). Les **variables locales** n'en ont pas : les lire sans les initialiser est une erreur de compilation.

```java
class Compteur { int n; }                 // n vaut 0
void f() { int x; System.out.println(x); } // erreur de compilation
```

Depuis Java 10, `var` laisse le compilateur déduire le type d'une variable **locale**. Le typage reste statique (ce n'est pas un `any`).

```java
var total = 0;                      // int
var noms = new ArrayList<String>();  // ArrayList<String>
```

## Erreurs fréquentes
- Écrire `'abc'` pour une chaîne : les guillemets simples sont réservés au `char`.
- Oublier le suffixe `L` ou `f` : `long x = 3000000000;` ne compile pas.
- Diviser deux entiers en attendant un décimal : `7 / 2` vaut `3`.
- Comparer deux `double` avec `==`.

## À retenir
- 8 primitifs ; `int` et `double` sont les défauts.
- Élargissement implicite, rétrécissement avec cast (qui tronque).
- Champs initialisés par défaut, variables locales jamais.
- `double` est approché : `BigDecimal` pour l'argent.

@@ quiz f2-001 easy
::question
Quel est le type par défaut d'un littéral décimal comme `3.14` ?
::choices
- [ ] float
- [x] double
- [ ] BigDecimal
- [ ] long
::answer
`double`.
::explanation
Pour obtenir un `float`, il faut le suffixe : `3.14f`. Pour un `long` : `10L`.
::hint
Quel suffixe faut-il écrire pour obtenir un `float` ?

@@ quiz f2-002 easy
::question
Lesquels **ne** sont **pas** des types primitifs ?
::choices
- [ ] int
- [x] String
- [ ] boolean
- [x] Integer
::answer
`String` et `Integer`.
::explanation
Les 8 primitifs : `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`. `Integer` est la classe *wrapper* de `int`.

@@ quiz f2-003 easy
::question
Quelle est la valeur par défaut d'un **champ** `boolean` non initialisé ?
::choices
- [x] false
- [ ] true
- [ ] null
- [ ] 0
::answer
`false`.
::explanation
Les champs reçoivent une valeur par défaut (`0`, `false`, `null`). Les variables **locales** n'en ont pas : les utiliser sans les initialiser est une erreur de compilation.

@@ quiz n-decl easy
::question
Quelle déclaration est valide ?
::choices
- [ ] int x = "5";
- [ ] String s = 'abc';
- [x] double d = 5;
- [ ] boolean b = 1;
::answer
`double d = 5;`
::explanation
Un `int` s'élargit implicitement en `double`. `'abc'` n'est pas valide (les guillemets simples sont réservés aux `char`), et `boolean` n'accepte que `true` ou `false`.

@@ quiz n-int easy
::question
Combien de bits fait un `int` en Java ?
::choices
- [ ] 16
- [x] 32
- [ ] 64
- [ ] 8
::answer
32 bits.
::explanation
Plage : de -2³¹ à 2³¹-1 (environ ±2,1 milliards). `long` : 64 bits.

@@ quiz n-cast easy
::question
Que vaut `(int) 3.9` ?
::choices
- [ ] 4
- [x] 3
- [ ] 3.9
- [ ] Erreur de compilation
::answer
`3`.
::explanation
Le cast d'un `double` vers `int` **tronque** (il n'arrondit pas). Pour arrondir : `Math.round`.

@@ quiz f2-004 medium
::question
Lesquelles de ces lignes **ne compilent pas** ?
::choices
- [ ] long a = 10;
- [x] int b = 10L;
- [x] float c = 1.5;
- [ ] double d = 1;
::answer
`int b = 10L;` et `float c = 1.5;`.
::explanation
Ce sont des conversions avec perte (`long` vers `int`, `double` vers `float`) : un cast ou le suffixe `f` est nécessaire. Les élargissements (`int` vers `long`, `int` vers `double`) sont implicites.
::hint
Un `long` rentre-t-il dans un `int`, un `double` dans un `float`, sans cast ?

@@ quiz f2-005 medium
::question
Quel est le résultat de `7 / 2 * 2.0` ?
::choices
- [ ] 7.0
- [x] 6.0
- [ ] 6
- [ ] 3.5
::answer
`6.0`.
::explanation
L'évaluation va de gauche à droite : `7 / 2` est une division **entière** (3), puis `3 * 2.0` donne `6.0`.
::hint
Évalue de gauche à droite : `7 / 2` entre deux `int` donne quoi ?

@@ quiz f2-012 medium
::question
Que donne `1.0 / 0` en Java ?
::choices
- [ ] ArithmeticException
- [x] Infinity
- [ ] NaN
- [ ] 0
::answer
`Infinity`.
::explanation
La division entière par zéro (`1 / 0`) lève `ArithmeticException`, mais pas la division flottante, qui donne `Infinity` (ou `NaN` pour `0.0 / 0`).
::hint
Division entière et division flottante ne réagissent pas pareil face à zéro.

@@ quiz f2-013 medium
::question
Lesquels conviennent pour des calculs monétaires **exacts** ?
::choices
- [ ] double
- [ ] float
- [x] BigDecimal
- [x] long (en centimes)
::answer
`BigDecimal` et `long` (en centimes).
::explanation
`double` et `float` utilisent une représentation binaire approchée : `0.1 + 0.2 != 0.3`. Avec `BigDecimal`, construire à partir d'une `String` (`new BigDecimal("0.1")`).
::hint
Un nombre binaire peut-il représenter exactement 0.1 ?

@@ card f2-025 medium
::question
Quelle est la sortie de ce code ?

```java
char c = 'a';
c += 1;
System.out.println(c);
System.out.println('a' + 1);
```
::answer
`b` puis `98`
::explanation
`c += 1` inclut un cast implicite vers `char`. `'a' + 1` est une expression `int` (code 97 + 1).
::hint
`'a'` vaut 97 en `int`, et `c += 1` fait un cast implicite vers `char`.

@@ card f2-028 medium
::question
Quelle est la sortie de ce code ?

```java
System.out.println(-7 / 2);
System.out.println(-7 % 2);
```
::answer
`-3` puis `-1`
::explanation
La division entière tronque vers zéro. Le reste (`%`) prend le signe du dividende : `-7 == -3 * 2 + (-1)`. Pour un modulo toujours positif : `Math.floorMod(-7, 2)` donne `1`.
::hint
La division entière tronque vers zéro ; le reste prend le signe du dividende.

@@ exercise e-aire easy Aire d'un cercle
::question
Déclare `double rayon = 3;`, calcule l'aire du cercle (`Math.PI * rayon²`) et affiche `Aire = ...`.
::starter
```java
public class Main {
    public static void main(String[] args) {
        double rayon = 3;
        // TODO : calcule l'aire et affiche "Aire = ..."
    }
}
```
::solution
```java
public class Main {
    public static void main(String[] args) {
        double rayon = 3;
        double aire = Math.PI * rayon * rayon;
        System.out.println("Aire = " + aire);
    }
}
```
::expected
```
Aire = 28.274333882308138
```
::checks
- Utilise Math.PI
- Le résultat est un double
::hint
`aire = Math.PI * rayon * rayon`
---
Concatène avec `"Aire = " + aire`.
::explanation
`Math.PI` est une constante `double`. La concaténation `+` convertit le `double` en texte.

@@ exercise e-cast easy Conversions et casts
::question
Convertis `7.9` en `int` (cast), puis multiplie-le par un milliard en `long`. Affiche les deux valeurs, une par ligne.
::starter
```java
public class Main {
    public static void main(String[] args) {
        double d = 7.9;
        // TODO : int i = ... ; long l = ... ; puis affiche i et l
    }
}
```
::solution
```java
public class Main {
    public static void main(String[] args) {
        double d = 7.9;
        int i = (int) d;
        long l = i * 1_000_000_000L;
        System.out.println(i);
        System.out.println(l);
    }
}
```
::expected
```
7
7000000000
```
::checks
- Le cast tronque (7.9 donne 7)
- Le calcul est fait en long (suffixe L)
::hint
Un cast s'écrit `(int) d`.
---
Sans le suffixe `L`, `i * 1_000_000_000` déborde d'un `int`.
