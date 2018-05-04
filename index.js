const codetabs = require('../gitbook-plugin-codetabs');

const scalaVersion = '2.11';

const sbtBodyGenerator = dependencies => {
	const sbtDependencies = dependencies.map(dependency => {
		const scope = dependency.scope ? ` % "${dependency.scope}"` : '';
		return `  "${dependency.groupId}" %${dependency.isScala ? '%' : ''} "${dependency.artifactId}" % "${dependency.version}"${scope}`;
	});
	return `libraryDependencies ++= Seq(\n${sbtDependencies.join(',\n')}\n)`;
};

const mvnBodyGenerator = dependencies => {
	const xmlDependencies = dependencies.map(dependency => {
		const scalaCompatVersion = dependency.isScala ? `_\${scala.compat.version}` : '';
		const scope = dependency.scope ? `\n        <scope>${dependency.scope}</scope>` : '';
		return `    <dependency>
        <groupId>${dependency.groupId}</groupId>
        <artifactId>${dependency.artifactId}${scalaCompatVersion}</artifactId>
        <version>${dependency.version}</version>${scope}
    </dependency>`;
	});
	return `<dependencies>
${xmlDependencies.join('\n')}
</dependencies>`;
};

const gradleBodyGenerator = dependencies => {
	const gradleDependencies = dependencies.map(dependency => {
		const scope = dependency.scope ? dependency.scope : 'compile';
		const nameSuffix = dependency.isScala ? `_${scalaVersion}` : '';
		return `    ${scope} group: '${dependency.groupId}', name: '${dependency.artifactId}${nameSuffix}', version:'${dependency.version}'`;
	});
	return `dependencies {\n${gradleDependencies.join('\n')}\n}`;
};

function Dependency(groupId, artifactId, version, isScala, scope) {
	this.groupId = groupId;
	this.artifactId = artifactId;
	this.version = version;
	this.isScala = isScala;
	this.scope = scope;
}

/*
Let testDependencies = [
    new Dependency('a-groupId', 'a-artifactId', 'a-version', true, 'a-scope'),
    new Dependency('b-groupId', 'b-artifactId', 'b-version', true),
    new Dependency('c-groupId', 'c-artifactId', 'c-version', false, 'c-scope'),
    new Dependency('d-groupId', 'd-artifactId', 'd-version', false),
]

console.log(sbtBodyGenerator(testDependencies))
console.log(mvnBodyGenerator(testDependencies))
console.log(gradleBodyGenerator(testDependencies))
*/

function Manager(displayName, language, bodyGenerator) {
	this.displayName = displayName;
	this.language = language;
	this.bodyGenerator = bodyGenerator;
}

const managers = {
	sbt: new Manager('SBT', 'scala', sbtBodyGenerator),
	maven: new Manager('Maven', 'xml', mvnBodyGenerator),
	gradle: new Manager('Gradle', 'groovy', gradleBodyGenerator)
};

const defaultManagers = ['sbt', 'maven', 'gradle'];

const parseDepedencies = body => {
	return body
        .split(/[\n\r]+/)
        .filter(line => Boolean(line.trim()))
        .map(line => {
	const [groupId, isScala, artifactId,, version,, scope] = line.split(/%(%?)/).map(i => i.trim().replace(/"/g, ''));
	return new Dependency(groupId, artifactId, version, Boolean(isScala), scope);
});
};

/*
ParseDepedencies(`
  "a-groupId" %% "a-artifactId" % "a-version" % "a-scope"
  "b-groupId" %% "b-artifactId" % "b-version"
  "c-groupId" % "c-artifactId" % "c-version" % "c-scope"
  "d-groupId" % "d-artifactId" % "d-version"
`)
*/

const createBlocks = body => {
	const dependencies = parseDepedencies(body);

	const [head, ...tail] = defaultManagers.map(name => {
		const manager = managers[name];
		return {
			body: manager.bodyGenerator(dependencies),
			kwargs: {
				type: manager.language,
				name: manager.displayName
			}
		};
	});

	head.blocks = tail;

	return head;
};

module.exports = {
	createBlocks,
	blocks: {
		javadeps: {
			process(blk) {
				return codetabs.blocks.codetabs.process(createBlocks(blk.body));
			}
		}
	}
};

