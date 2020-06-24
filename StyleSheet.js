import {StyledComponent} from './StyledComponent';
import styledRefCount from './StyledRefCount';
import assert from 'assert';

const GC_THRESHOLD = 100; // Garbage collect when there are over 'n' unused rule groups

class StyleSheet {
  debug() {
    return false;  // enable debug logging for garbage collection
  }

  addStyleSheet() {
    // Add stylesheet
    this.style = document.createElement('style');
    document.head.appendChild(this.style);
    this.sheet = this.style.sheet;
    this.rules = this.sheet.cssRules || this.sheet.rules;
  }

  /**
   * Add new rule
   * @param {*} rules
   */
  addRules(rules) {
    if(this.style === undefined) this.addStyleSheet();

    if(styledRefCount.getCanGcCount() > GC_THRESHOLD) {
      this.garbageCollection();
    }

    rules.forEach((rule) => {
      // In development use insertRule to validate the rule
      if(process.env.NODE_ENV === 'development') {
        const ruleId = this.rules.length;
        this.sheet.insertRule(rule, ruleId);
        this.sheet.deleteRule(ruleId);
        const node = document.createTextNode(rule);
        this.style.appendChild(node);
      }
      else {
        const ruleId = this.rules.length;
        this.sheet.insertRule(rule, ruleId);
      }
    })
  }

  /**
   * Garbage collection
   * todo: clean up this code
   */
  garbageCollection() {
    if(process.env.NODE_ENV === 'development') {
      console.log(`>> garbageCollection canGc=${styledRefCount.getCanGcCount()}`);
    }
    if(process.env.NODE_ENV === 'development') {
      this.garbageCollection_dev();
    }
    else {
      for(let i = 0; i < this.rules.length; ++i) {
        const rule = this.rules[i];
        const selector = rule.selectorText;
        const className = selector.substring(1); // remove period
        if(className.indexOf(':') !== -1) continue; // Ignore rules with class:modifer selector
        if(styledRefCount.okToGc(className)) {
          // Delete all rules having match class name
          for(;;) {
            this.sheet.deleteRule(i);

            // Anymore rules in this group
            if(i === this.rules.length) break;
            if(this.rules[i].selectorText.indexOf(className+':') === -1) break;
          }
          --i;
          StyledComponent.deleteClass(className);
        }
      }
      const canGcCount = styledRefCount.getCanGcCount();
      assert(canGcCount === 0, `Can garbage collect count should be zero ${canGcCount}`);
    }
    if(process.env.NODE_ENV === 'development') {
      console.log(`>> garbageCollection completed canGc=${styledRefCount.getCanGcCount()}`);
    }
  }

  garbageCollection_dev() {
    for(let i = 0; i < this.style.childNodes.length; ++i) {
      const rule = this.style.childNodes[i].textContent.trim();
      let endOfSelector = rule.indexOf(' ');
      if(endOfSelector === -1) endOfSelector.indexOf('{');
      if(endOfSelector === -1) endOfSelector.indexOf('\n');
      const className = rule.substring(0,endOfSelector).trim().substring(1); // remove period
      if(className.indexOf(':') !== -1) continue; // Ignore rules with class:modifer selector
      if(styledRefCount.okToGc(className)) {
        // Delete all rules having match class name
        for(;;) {
          this.style.removeChild(this.style.childNodes[i]);

          // Anymore rules in this group
          if(i === this.style.childNodes.length) break;
          const nextRule = this.style.childNodes[i].textContent;
          if(nextRule.indexOf(className+':') === -1) break;
        }
        --i;
        StyledComponent.deleteClass(className);
      }
    }
    const canGcCount = styledRefCount.getCanGcCount();
    assert(canGcCount === 0, `Can garbage collect count should be zero ${canGcCount}`);
  }
}

const styleSheet = new StyleSheet();
export default styleSheet;