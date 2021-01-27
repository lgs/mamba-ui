import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class FormatterService {
	constructor() {}

	beautifyHTML(codeStr: string, startAtLevel = 0): string {
		const div = document.createElement('div');
		let cleanedString = this.removeAngularCode(codeStr);
		cleanedString = this.removeAngularComments(cleanedString);
		cleanedString = this.removeEmptyClasses(cleanedString);
		cleanedString = this.removeEmptyWhitespace(cleanedString);
		//cleanedString = this.toggleDarkModeVariants(cleanedString);

		div.innerHTML = cleanedString.trim();
		return this.formatNode(div, startAtLevel).innerHTML.trim();
	}

	formatNode(node: any, level: number) {
		const indentBefore = level > 0 ? '\t'.repeat(level) : '';
		const indentAfter = indentBefore.substr(1);
		let textNode;

		for (let i = 0; i < node.children.length; i++) {
			level++;
			textNode = document.createTextNode('\n' + indentBefore);
			node.insertBefore(textNode, node.children[i]);

			this.formatNode(node.children[i], level);

			if (node.lastElementChild === node.children[i]) {
				textNode = document.createTextNode('\n' + indentAfter);
				node.appendChild(textNode);
			} else {
				level--;
			}
		}

		return node;
	}

	/**
	 * Removes Angular directives that start with "_ng" or "ng" from the string
	 * @param codeStr The code
	 */
	removeAngularCode(codeStr: string) {
		// removes parts that start with "_ng"
		return codeStr.replace(/ng-[^"\s]*="[^"]*"/g, '');
	}

	/**
	 * Removes Angular binding comments for "ng-reflect-ng-if" and "ng-reflect-for-of" for example
	 * @param codeStr The code
	 */
	removeAngularComments(codeStr: string) {
		return codeStr.replace(/<!--[.\s\w=":,{}[\]-]+-->/gm, '');
	}

	/**
	 * Removes class=""
	 * @param codeStr The code
	 */
	removeEmptyClasses(codeStr: string) {
		return codeStr.replace(/ class=""/gm, '');
	}

	/**
	 * Removes extra whitespace between the opening and closing tags
	 * <span> Whitespace before and after this text will be removed </span>
	 * @param codeStr The code
	 */
	removeEmptyWhitespace(codeStr: string) {
		return codeStr.replace(/>\s([^<]*)\s</g, '>$1<');
	}

	toggleDarkModeVariants(codeStr: string, darkTheme: boolean) {
		return darkTheme
			? codeStr.replace(/(bg|border|placeholder|text|from|via|to)-/gm, 'dark:$1-')
			: codeStr.replace(/dark:/gm, '');
	}

	replaceColor(codeStr: string, oldColor: string, newColor: string) {
		return codeStr.replace('-' + oldColor + '-', '-' + newColor + '-');
	}

	useReactSyntax(codeStr: string) {
		const cleanSVGs = codeStr.replace(/(stroke|fill|clip)-[a-z]/g, prop => {
			const parts = prop.split('-');
			return parts[0] + parts[1].toUpperCase();
		});
		return cleanSVGs.replace(/class=/gm, 'className=');
	}

	toVue(codeStr: string) {
		let content = '<template>\n\t';
		content += this.beautifyHTML(codeStr, 1) + '\n';
		content += '</template>';
		return content;
	}

	toReactFunctional(codeStr: string) {
		let content = 'const MambaUI = (props) => {\n';
		content += '\t return (\n';
		content += '\t\t' + this.beautifyHTML(codeStr, 2);
		content += '\n\t);\n';
		content += '});';
		return this.useReactSyntax(content);
	}

	toReactClass(codeStr: string) {
		let content = 'var mambaUI = React.createClass({\n';
		content += '\t render: function() {' + '\n';
		content += '\t\t return (';
		content += codeStr;
		content += '\n\t\t);\n';
		content += '\t}\n';
		content += '});';
		const beautified = this.beautifyHTML(content, 3);
		return this.useReactSyntax(beautified);
	}

	copyToClipboard(code: string) {
		const el = document.createElement('textarea');
		el.value = code;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}
}
