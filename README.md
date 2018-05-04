GitBook Plugin For Java/Scala Library Dependencies
==============

This plugin helps to generate correct library dependencies
for the following build systems:

  * SBT
  * Maven
  * Gradle

Import the plugins in the file `book.json`:

```javascript
{
  "title": "Test book",
  "plugins": [
    "javadeps",
    "codetabs"
  ]
}
```

Note that `codetabs` is a dependency of `javadeps` and must
therefore be imported as well.

In your gitbook, write the following dependencies:

```markdown
{% javadeps %}
  "a-groupId" %% "a-artifactId" % "a-version" % "a-scope"
  "b-groupId" %% "b-artifactId" % "b-version"
  "c-groupId" % "c-artifactId" % "c-version" % "c-scope"
  "d-groupId" % "d-artifactId" % "d-version"
{% endjavadeps %}
```

`%%` means that the dependency is a scala dependency.

Run `gitbook install` and `gitbook build`. The dependencies
for the SBT, Maven and Gradle build systems will be generated
in different code tabs.
