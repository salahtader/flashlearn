---
id: java-u06-heritage
subject: Java
level: 2
order: 6
title: Héritage, interfaces et polymorphisme
description: abstract, interface, override, enum, instanceof
language: fr
tags: java, parcours
---
# Héritage, interfaces et polymorphisme

> **Objectif** : réutiliser du code avec l'héritage, définir des contrats avec les interfaces et faire du polymorphisme.

## 1. Héritage et classes abstraites

Une sous-classe **étend** une seule classe et hérite de ses membres non privés. `super(...)` appelle le constructeur du parent. Une classe `abstract` ne peut pas être instanciée et peut imposer des méthodes à ses enfants.

```java
abstract class Animal {
    protected final String nom;
    Animal(String nom) { this.nom = nom; }
    abstract String cri();                       // à implémenter dans chaque sous-classe
    void presenter() { System.out.println(nom + " fait " + cri()); }
}
class Chien extends Animal {
    Chien(String nom) { super(nom); }
    @Override String cri() { return "Wouf"; }
}
class Chat extends Animal {
    Chat(String nom) { super(nom); }
    @Override String cri() { return "Miaou"; }
}
```

## 2. Polymorphisme

Une variable du type parent peut référencer n'importe quelle sous-classe. La méthode exécutée est choisie **à l'exécution** selon le type réel de l'objet.

```java
List<Animal> zoo = List.of(new Chien("Rex"), new Chat("Tom"));
for (Animal a : zoo) a.presenter();   // Rex fait Wouf, puis Tom fait Miaou
```

| | Surcharge (*overload*) | Redéfinition (*override*) |
|---|---|---|
| Où | même classe | sous-classe |
| Signature | paramètres différents | identique |
| Choisie | à la compilation | à l'exécution |

Les méthodes `static` ne sont **pas** redéfinies : elles sont *masquées* et dépendent du type déclaré de la variable.

## 3. Interfaces

Une interface décrit un **rôle** : des méthodes à fournir, sans état d'instance. Une classe n'étend qu'une classe, mais peut implémenter plusieurs interfaces.

```java
interface Volant {
    int ALTITUDE_MAX = 10_000;                       // implicitement public static final
    String deplacer();                                // implicitement public abstract
    default String decoller() { return "décolle"; }   // méthode par défaut (Java 8+)
}
class Oiseau implements Volant, Comparable<Oiseau> {
    public String deplacer() { return "vole"; }
    public int compareTo(Oiseau o) { return 0; }
}
```

| | Interface | Classe abstraite |
|---|---|---|
| Héritage multiple | oui | non |
| Champs d'instance | non | oui |
| Constructeur | non | oui |
| Pour | un rôle, un contrat | une base commune avec état |

> **Conseil** : préfère la **composition** à l'héritage. Hérite quand la relation « est un » est vraie et stable, sinon contiens un objet et délègue.

## 4. `enum`

Un `enum` est un ensemble fixe de constantes. Il peut avoir des champs, des méthodes et implémenter des interfaces, mais pas étendre une classe. Son constructeur est implicitement `private`.

```java
enum Niveau {
    DEBUTANT(1), AVANCE(3);
    private final int poids;
    Niveau(int poids) { this.poids = poids; }
    int getPoids() { return poids; }
}
Niveau n = Niveau.valueOf("AVANCE");   // à partir d'un texte
for (Niveau x : Niveau.values()) System.out.println(x + " " + x.getPoids());
```

## 5. `instanceof` avec *pattern matching* (Java 16+)

```java
Object o = "bonjour";
if (o instanceof String s && s.length() > 3) {
    System.out.println(s.toUpperCase());   // s est déjà converti en String
}
```

## Erreurs fréquentes
- Oublier `@Override` : une faute de frappe crée une nouvelle méthode au lieu de redéfinir.
- Réduire la visibilité en redéfinissant (une méthode `public` ne peut pas devenir `private`).
- Hériter pour réutiliser du code alors que la relation « est un » est fausse.

## À retenir
- Polymorphisme : le type réel décide de la méthode appelée.
- Une classe : un seul parent. Interfaces : autant que nécessaire.
- Interface = rôle sans état ; classe abstraite = base avec état.
- `enum` pour un ensemble fixe de valeurs.

@@ card oop-002 easy
::question
Surcharge (*overload*) vs redéfinition (*override*) ?
::answer
**Surcharge** : même nom, paramètres différents, résolue à la **compilation**. **Redéfinition** : même signature dans une sous-classe, résolue à l'**exécution** (polymorphisme dynamique).
::explanation
`@Override` fait vérifier par le compilateur qu'on redéfinit bien une méthode du parent.
::hint
Qui choisit la méthode : le compilateur ou la JVM ?

@@ quiz f2-016 medium
::question
Dans une interface, le champ `int MAX = 10;` est implicitement :
::choices
- [x] public static final
- [ ] private
- [ ] modifiable
- [ ] un champ d'instance
::answer
`public static final`.
::explanation
Les champs d'interface sont des constantes. Les méthodes abstraites sont implicitement `public abstract`.

@@ card oop-001 medium
::question
Classe abstraite ou interface : quelles différences ?
::answer
**Interface** : contrat sans état d'instance (constantes uniquement), implémentation multiple, méthodes `default`, `static` et `private` possibles. **Classe abstraite** : peut avoir des champs, des constructeurs et du code partagé, mais une seule peut être héritée.
::explanation
Règle pratique : interface pour définir un rôle/capacité, classe abstraite pour factoriser un état et un comportement communs.

@@ card oop-005 medium
::question
Quels sont les 4 types de classes imbriquées ?
::answer
1. **Static nested** : indépendante de l'instance externe. 2. **Inner** (non statique) : liée à une instance de la classe externe. 3. **Locale** : déclarée dans une méthode. 4. **Anonyme** : sans nom, déclarée et instanciée en une expression.
::explanation
Une classe inner garde une référence implicite vers l'instance externe : source possible de fuite mémoire.

@@ quiz f2-017 medium
::question
Lesquelles de ces affirmations sur les `enum` sont vraies ?
::choices
- [x] Peut avoir des champs et des méthodes
- [ ] Peut étendre une autre classe
- [x] A un constructeur implicitement private
- [x] Peut implémenter des interfaces
::answer
Un `enum` peut avoir des champs et méthodes, un constructeur implicitement `private`, et implémenter des interfaces.
::explanation
Il ne peut pas étendre une classe : il étend déjà implicitement `java.lang.Enum`.

@@ card f2-030 medium
::question
À quoi sert l'opérateur `instanceof` et quelle est sa forme moderne ?
::answer
Il teste si un objet est une instance d'un type. Depuis Java 16, le *pattern matching* évite le cast : `if (o instanceof String s) { s.length(); }`.
::explanation
`null instanceof X` vaut toujours `false`.

@@ card oop-003 hard
::question
Quelle est la sortie de ce code ?

```java
class A { static String id() { return "A"; } String who() { return "A"; } }
class B extends A { static String id() { return "B"; } String who() { return "B"; } }

A a = new B();
System.out.println(a.id() + a.who());
```
::answer
`AB`
::explanation
`a.id()` est statique : elle est résolue sur le type **déclaré** (`A`) et la méthode statique est *masquée*, pas redéfinie. `a.who()` est dynamique : le type réel `B` est utilisé.
::hint
Une méthode `static` dépend du type **déclaré** de la variable.

@@ exercise e-formes medium Polymorphisme : formes
::question
Implémente `Carre` (côté) et `Cercle` (rayon) qui implémentent `Forme`. Le programme affiche l'aire arrondie à 2 décimales de chacune.
::starter
```java
interface Forme { double aire(); }

// TODO : classes Carre et Cercle

public class Main {
    public static void main(String[] args) {
        Forme[] formes = { new Carre(2), new Cercle(1) };
        for (Forme f : formes) {
            System.out.println(Math.round(f.aire() * 100) / 100.0);
        }
    }
}
```
::solution
```java
interface Forme { double aire(); }

class Carre implements Forme {
    private final double cote;
    Carre(double cote) { this.cote = cote; }
    public double aire() { return cote * cote; }
}

class Cercle implements Forme {
    private final double rayon;
    Cercle(double rayon) { this.rayon = rayon; }
    public double aire() { return Math.PI * rayon * rayon; }
}

public class Main {
    public static void main(String[] args) {
        Forme[] formes = { new Carre(2), new Cercle(1) };
        for (Forme f : formes) {
            System.out.println(Math.round(f.aire() * 100) / 100.0);
        }
    }
}
```
::expected
```
4.0
3.14
```
::checks
- Les deux classes implémentent Forme
- La méthode aire() est publique
::hint
Les méthodes d'interface sont `public` : n'oublie pas le modificateur dans la classe.
---
Constructeur : `Carre(double cote)`.
