import React from 'react';
import ReactDOM from 'react-dom';
import styleSheet from './StyleSheet';
import assert from 'assert';
import styledRefCount from './StyledRefCount';
import StyledElement from './StyledElement';
import validAttr from '@emotion/is-prop-valid'; // dev only

let debug = false;
let uniqueId = 0;
let styleToClassMap = {};

export class StyledComponent extends React.Component {

  /**
   * Delete the specified class.
   * @param {string} className
   */
  static deleteClass(className) {
    if(debug) console.log(`>> deleteClass ${className}`);

    assert(styledRefCount.okToGc(className), `Cannot delete class with refCount=${styledRefCount.getRefCount(className)}`);

    const styleString = styledRefCount.getStyleString(className);
    delete styleToClassMap[styleString];
    styledRefCount.garbageCollect(className);
  }

  /**
   * Evaluate variable and function defined in the styles.
   * @returns {style, canGarbageCollect}
   */
  evaluateStyles() {
    let styleString = ``;
    let canGarbageCollect = false;
    for (const [i, expression] of this.props._ScExpressions.entries()) {
      // Only garbage collect, if a functional expression is defined in style
      if(typeof expression === 'function') canGarbageCollect = true;
      const val = typeof expression === 'function' ? expression(this.props) : expression;
      styleString += this.props._ScLiterals[i] + val;
    }
    styleString += this.props._ScLiterals[this.props._ScLiterals.length - 1];
    return {styleString, canGarbageCollect};
  }

  /**
   * Update style, if necessary
   */
  updateStyle() {

    // Evaluate variables and functions to generate style string
    const {styleString, canGarbageCollect} = this.evaluateStyles();

    // Look up existing class name for the style, if this style has already be used.
    const foundClassName = styleToClassMap[styleString];

    if(debug) console.log(`>> updateStyle found=${foundClassName} cached=${this.cachedClassName} ${styleString}`);

    // Style is alread defined in the style sheet?
    if(foundClassName) {
      // Cached class name doesn't match the updated style?
      if(this.cachedClassName !== foundClassName) {

        if(this.cachedClassName) {
          styledRefCount.decrement(this.cachedClassName);
          this.styledElement.removeClassAttr(this.cachedClassName);
        }

        this.cachedClassName = foundClassName;
        styledRefCount.increment(this.cachedClassName);
        this.styledElement.addClassAttr(this.cachedClassName);
      }
      else {
        if(!this.styledElement.containsClassAttr(this.cachedClassName)) {
          this.styledElement.addClassAttr(this.cachedClassName);
        }
      }
    }
    else { // create new class
      if(this.cachedClassName && this.styledElement.containsClassAttr(this.cachedClassName)) {
        this.styledElement.removeClassAttr(this.cachedClassName);
      }

      // Add new rule to sheet
      this.cachedClassName = `sc-${uniqueId++}`;
      styleToClassMap[styleString] = this.cachedClassName;
      styledRefCount.create(this.cachedClassName, styleString, canGarbageCollect);
      this.styledElement.addClassAttr(this.cachedClassName);
      this.addRulesToSheet(styleString);
    }
  }

  /**
   * Add new rules for a new class name
   * @param {string} styleString
   */
  addRulesToSheet(styleString) {
    const selector = `.${this.cachedClassName}`;

    /**
     * Separate the imbedded rules (e.g,, :hover {)) from the base rule
     */
    let baseRule = '';
    let imbeddedRules = [];
    const lines = styleString.split('\n');
    for(let i = 0; i < lines.length; ++i) {
      let line = lines[i].trimLeft();
      if(line.startsWith(':') || line.startsWith('&')) {
        if(line.startsWith('&')) line = line.substring(1);
        let rule = selector + line+'\n';
        ++i
        for(; i < lines.length; ++i) {
          rule += lines[i]+'\n';         ;
          if(lines[i].indexOf('}') !== -1) break;
        }
        imbeddedRules.push(rule);
      }
      else {
        baseRule += line+'\n';
      }
    }

    baseRule = `${selector} { ${baseRule} }`;

    let rules = [baseRule];
    imbeddedRules.forEach((rule) => {
      rules.push(rule);
    });

    if(debug) console.log('>> addRulesToSheet', this.cachedClassName, rules);

    /**
     * Add rules into style sheet
     */
    styleSheet.addRules(rules);
  }

  doDebug() {
    return this.props.debug;
  }

  componentDidMount() {
    debug = this.doDebug();
    if(debug) console.log(`> componentDidMount`);
    this.styledElement = new StyledElement(ReactDOM.findDOMNode(this), debug);
    this.updateStyle();
    debug = false;
  }

  componentDidUpdate() {
    debug = this.doDebug();
    if(debug) console.log(`> componentDidUpdate cached=${this.cachedClassName}`);
    this.updateStyle();
    debug = false;
  }

  componentWillUnmount() {
    debug = this.doDebug();
    if(debug) console.log(`> componentWillUnmount ${this.cachedClassName}`);
    styledRefCount.decrement(this.cachedClassName);
    debug = false;
  }

  render() {
    if(this.doDebug()) console.log(`> render`);
    let props = {...this.props};
    Object.keys(this.props).forEach(key => {
      if(key.startsWith('_Sc')) {delete props[key];}
      // This code tried to eliminate Warnings in console log: "Invalid DOM property...""
      else if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        if(!validAttr(key) && typeof this.props._ScTag === 'string') {
          delete props[key]; // Remove non HTML attributes
        }
      }
    });

    return <this.props._ScTag {...props} ref={this.props._ScForwardRef}/>
  }
};

//export default styled;
const styled = (tag) => (literals, ...expressions) => {
  return React.forwardRef((props, ref) => {
    return (
      <StyledComponent {...props}
              _ScTag={tag}
              _ScForwardRef={ref}
              _ScLiterals={literals}
              _ScExpressions={expressions}/>
    );
  });
};

export default styled;