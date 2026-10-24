---
id: java-u13-reflection
subject: Java
level: 3
order: 14
title: Réflexion et sérialisation
description: Class<T>, getMethods, defaultReadObject
language: fr
tags: java, parcours
---
# Réflexion et sérialisation

> **Objectif** : inspecter des classes à l'exécution et comprendre la sérialisation Java native (et ses risques).

## 1. La réflexion

La réflexion permet de lire et d'appeler des classes **à l'exécution**, sans les connaître à la compilation. C'est la base des frameworks (Spring, JUnit, Jackson…).

```java
Class<?> c1 = String.class;                         // à partir d'un type connu
Class<?> c2 = "bonjour".getClass();                 // à partir d'un objet
Class<?> c3 = Class.forName("java.util.ArrayList"); // à partir d'un nom (peut lever ClassNotFoundException)

c1.getName();                                        // "java.lang.String"
```

## 2. Méthodes, champs, constructeurs

| Appel | Retourne |
|---|---|
| `getMethods()` | méthodes **publiques**, héritées incluses |
| `getDeclaredMethods()` | **toutes** les méthodes déclarées par la classe (toute visibilité), héritées exclues |
| `getDeclaredFields()` | tous les champs déclarés |
| `getDeclaredConstructor(...)` | un constructeur |

```java
Method m = String.class.getMethod("length");
Object r = m.invoke("bonjour");                      // 7

class Personne { private int age = 36; }
Personne p = new Personne();
Field f = Personne.class.getDeclaredField("age");
f.setAccessible(true);                               // contourne private (dans ton propre code)
f.setInt(p, 40);
```

`setAccessible(true)` ne fonctionne pas sur les classes internes du JDK (système de modules). La réflexion est plus lente, contourne la vérification de types à la compilation et casse l'encapsulation : à réserver aux outils et frameworks.

## 3. Annotations lues à l'exécution

```java
@Retention(RetentionPolicy.RUNTIME)     // visible à l'exécution
@Target(ElementType.METHOD)
@interface Test {}

class MesTests {
    @Test void additionne() { System.out.println("ok"); }
    void utilitaire() {}
}

for (Method m : MesTests.class.getDeclaredMethods()) {
    if (m.isAnnotationPresent(Test.class)) m.invoke(new MesTests());   // ce que fait JUnit
}
```

## 4. Sérialisation Java native

Elle transforme un objet en suite d'octets (`ObjectOutputStream`) et inversement (`ObjectInputStream`). La classe doit implémenter `Serializable`.

```java
class Utilisateur implements Serializable {
    private static final long serialVersionUID = 1L;   // identifie la version de la classe
    String nom;
    transient String motDePasse;                        // exclu de la sérialisation
}

try (var out = new ObjectOutputStream(Files.newOutputStream(Path.of("u.bin")))) {
    out.writeObject(utilisateur);
}
try (var in = new ObjectInputStream(Files.newInputStream(Path.of("u.bin")))) {
    Utilisateur u2 = (Utilisateur) in.readObject();     // motDePasse vaut null
}
```

Pour personnaliser, une classe peut définir ces méthodes **privées** :

```java
private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    in.defaultReadObject();     // restaure les champs non statiques et non transient
    if (nom == null) throw new InvalidObjectException("nom manquant");   // validation
}
```

`defaultReadObject()` a pour pendant `defaultWriteObject()` à l'écriture.

> **Sécurité** : ne désérialise **jamais** des données qui ne viennent pas d'une source de confiance. C'est une faille classique d'exécution de code à distance. Pour échanger des données, préfère un format texte comme JSON.

## Erreurs fréquentes
- Confondre le JSON de cette application avec la sérialisation Java native : ce sont deux choses différentes.
- Oublier `serialVersionUID` : un changement de classe casse la lecture des anciens fichiers.
- Utiliser la réflexion quand une interface ou un polymorphisme suffirait.
- Sérialiser un champ sensible sans le marquer `transient`.

## À retenir
- `getMethods()` : publiques et héritées. `getDeclaredMethods()` : déclarées par la classe.
- La réflexion sert aux frameworks ; elle coûte en performance et en sécurité de type.
- `transient` exclut un champ ; `defaultReadObject()` restaure les autres.
- Ne désérialise jamais des données non fiables.

@@ card refl-001 medium
::question
À quoi sert `Class<T>` ?
::answer
À représenter le type d'une classe à l'exécution et à l'introspecter (champs, méthodes, constructeurs, annotations).
::explanation
`Class<String> type = String.class;`

@@ card refl-002 medium
::question
`getMethods()` vs `getDeclaredMethods()` ?
::answer
`getMethods()` : méthodes **publiques**, héritées incluses. `getDeclaredMethods()` : toutes les méthodes **déclarées** par la classe (toute visibilité), héritées exclues.

@@ card ser-001 hard
::question
Quel est le rôle de `defaultReadObject()` ?
::answer
Dans un `private void readObject(ObjectInputStream in)` personnalisé, il restaure les champs non `static` et non `transient` de la classe, avant d'appliquer une logique spécifique.
::explanation
Son pendant à l'écriture est `defaultWriteObject()`.

@@ quiz n-decl medium
::question
Que retourne `getDeclaredMethods()` ?
::choices
- [ ] Seulement les méthodes publiques
- [x] Toutes les méthodes déclarées par la classe (toute visibilité), héritées exclues
- [ ] Seulement les méthodes héritées
- [ ] Seulement les méthodes statiques
::explanation
Les méthodes **déclarées** par la classe elle-même, privées comprises. `getMethods()` retourne les méthodes publiques, héritées incluses.

@@ quiz n-trans medium
::question
Quel mot-clé exclut un champ d'instance de la sérialisation Java ?
::choices
- [ ] volatile
- [x] transient
- [ ] final
- [ ] synchronized
::explanation
`transient`. À la désérialisation, le champ reçoit sa valeur par défaut (`null`, `0`…).

@@ quiz n-unsafe hard
::question
Pourquoi ne faut-il jamais désérialiser des données non fiables ?
::choices
- [ ] C'est plus lent
- [x] Cela peut permettre l'exécution de code à distance
- [ ] Cela corrompt le fichier
- [ ] Java l'interdit
::explanation
Une classe malveillante présente dans le classpath peut exécuter du code pendant la désérialisation : c'est une faille classique. Préfère un format comme JSON.

@@ exercise e-refl medium Exécuter les méthodes annotées
::question
Comme le fait JUnit : exécute uniquement les méthodes annotées `@Test` de `MesTests`, par ordre alphabétique.
::starter
```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@interface Test {}

class MesTests {
    @Test public void additionne() { System.out.println("additionne ok"); }
    @Test public void soustrait() { System.out.println("soustrait ok"); }
    public void utilitaire() { System.out.println("ne doit pas s'exécuter"); }
}

public class Main {
    public static void main(String[] args) throws Exception {
        MesTests instance = new MesTests();
        // TODO
    }
}
```
::solution
```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@interface Test {}

class MesTests {
    @Test public void additionne() { System.out.println("additionne ok"); }
    @Test public void soustrait() { System.out.println("soustrait ok"); }
    public void utilitaire() { System.out.println("ne doit pas s'exécuter"); }
}

public class Main {
    public static void main(String[] args) throws Exception {
        MesTests instance = new MesTests();
        Method[] methodes = MesTests.class.getDeclaredMethods();
        Arrays.sort(methodes, Comparator.comparing(Method::getName));
        for (Method m : methodes) {
            if (m.isAnnotationPresent(Test.class)) m.invoke(instance);
        }
    }
}
```
::expected
```
additionne ok
soustrait ok
```
::checks
- getDeclaredMethods ne garantit aucun ordre : trie
- N'invoque que les méthodes annotées
::hint
`m.isAnnotationPresent(Test.class)` teste l'annotation.
---
`m.invoke(instance)` exécute la méthode.
::explanation
`@Retention(RUNTIME)` rend l'annotation visible par réflexion. L'ordre de `getDeclaredMethods()` n'est pas garanti : on trie par nom pour un résultat stable.
