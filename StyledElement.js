export default class StyledElement {

  constructor(element, debug) {
    this.element = element;
    this.debug = debug;
  }

  containsClassAttr(className) {
    return this.element.getAttribute('class').split(' ').indexOf(className) !== -1;
  }

  addClassAttr(className) {
    // Add the styled component class name to the element without disturbing exist class names.
    let currentClass = this.element.getAttribute('class');

    if(currentClass) {
      currentClass = currentClass.replace(className, '').trim(); // make class is not already included

      // assert(currentClass.indexOf('sc-') === -1,
      //   `Unexpeced styled component class ${currentClass}, while adding ${className}`);
    }

    const newClassName = (currentClass ? currentClass + ' ': '') + className;
    this.element.setAttribute('class', newClassName);
    if(this.debug) console.log(`> addClass ${className} -> ${newClassName}`);
  }

  removeClassAttr(className) {
    const currentClass = this.element.getAttribute('class');
    const newClass = currentClass.split(' ').map(c => c === className ? '' : c).join(' ');
    this.element.setAttribute('class', newClass);
  }

}