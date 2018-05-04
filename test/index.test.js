import {test} from 'ava';
import {createBlocks} from '../index';

const stripMargin = str => {
	return str.replace(/[\n\r]+\s*\|/g, '\n');
};

test('hello world', t => {
	const body = `
		"a-groupId" %% "a-artifactId" % "a-version" % "a-scope"
		"b-groupId" %% "b-artifactId" % "b-version"
		"c-groupId" % "c-artifactId" % "c-version" % "c-scope"
		"d-groupId" % "d-artifactId" % "d-version"`;

	const expectedSbtBody = stripMargin(
		`libraryDependencies ++= Seq(
		|  "a-groupId" %% "a-artifactId" % "a-version" % "a-scope",
		|  "b-groupId" %% "b-artifactId" % "b-version",
		|  "c-groupId" % "c-artifactId" % "c-version" % "c-scope",
		|  "d-groupId" % "d-artifactId" % "d-version"
		|)`);

	const expectedMvnBody = stripMargin(
		`<dependencies>
		|    <dependency>
		|        <groupId>a-groupId</groupId>
		|        <artifactId>a-artifactId_\${scala.compat.version}</artifactId>
		|        <version>a-version</version>
		|        <scope>a-scope</scope>
		|    </dependency>
		|    <dependency>
		|        <groupId>b-groupId</groupId>
		|        <artifactId>b-artifactId_\${scala.compat.version}</artifactId>
		|        <version>b-version</version>
		|    </dependency>
		|    <dependency>
		|        <groupId>c-groupId</groupId>
		|        <artifactId>c-artifactId</artifactId>
		|        <version>c-version</version>
		|        <scope>c-scope</scope>
		|    </dependency>
		|    <dependency>
		|        <groupId>d-groupId</groupId>
		|        <artifactId>d-artifactId</artifactId>
		|        <version>d-version</version>
		|    </dependency>
		|</dependencies>`);

	const expectedGradleBody = stripMargin(
		`dependencies {
		|    a-scope group: 'a-groupId', name: 'a-artifactId_2.11', version:'a-version'
		|    compile group: 'b-groupId', name: 'b-artifactId_2.11', version:'b-version'
		|    c-scope group: 'c-groupId', name: 'c-artifactId', version:'c-version'
		|    compile group: 'd-groupId', name: 'd-artifactId', version:'d-version'
		|}`);

	const expectedBlocks = {
		body: expectedSbtBody,
		kwargs: {
			type: 'scala',
			name: 'SBT'
		},
		blocks: [{
			body: expectedMvnBody,
			kwargs: {
				type: 'xml',
				name: 'Maven'
			}
		}, {
			body: expectedGradleBody,
			kwargs: {
				type: 'groovy',
				name: 'Gradle'
			}
		}]
	};

	t.deepEqual(createBlocks(body), expectedBlocks);
});
