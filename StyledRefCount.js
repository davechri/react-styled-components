import styledSheet from './StyleSheet';
import assert from 'assert';

class StyledRefCount {
  classUsageMap = {};
  canGcCount = 0;
  unusedCount = 0; // number of styles that are not being used

  assertClassFound(className) {
    assert(className, `Class name is undefined`);
    assert(this.classUsageMap[className], `Class ${className} not found in ${Object.keys(this.classUsageMap)}`);
  }

  create(className, styleString, canGarbageCollect) {
    this.classUsageMap[className] = {refCount: 1, canGarbageCollect, styleString};
  }

  garbageCollect(className) {
    this.assertClassFound(className);
    assert(this.classUsageMap[className].refCount === 0, `Reference count is not zero ${className}`);
    assert(this.classUsageMap[className].canGarbageCollect, `Cannot garbage collect ${className}`);

    delete this.classUsageMap[className];

    --this.canGcCount;
    --this.unusedCount;
  }

  getStyleString(className) {
    this.assertClassFound(className);
    return this.classUsageMap[className].styleString;
  }

  getRefCount(className) {
    this.assertClassFound(className);
    return this.classUsageMap[className].refCount;
  }

  okToGc(className) {
    this.assertClassFound(className);
    const usage = this.classUsageMap[className];
    return usage.refCount === 0 && usage.canGarbageCollect;
  }

  getCanGcCount() {
    if(styledSheet.debug()) console.log(`>> total=${Object.keys(this.classUsageMap).length} unused=${this.unusedCount} canGc=${this.canGcCount}`);
    return this.canGcCount;
  }

  increment(className) {
    this.assertClassFound(className);
    const usage = this.classUsageMap[className];
    if(usage.refCount === 0) {
      assert(this.unusedCount > 0, `Unused count underflow for ${className}`);
      this.unusedCount--;
      if(usage.canGarbageCollect) {
        assert(this.canGcCount > 0, `Can garbage collect count underflow for ${className}`);
        this.canGcCount--;
      }
    }
    usage.refCount++;
  }

  decrement(className) {
    this.assertClassFound(className);
    const usage = this.classUsageMap[className];
    assert(usage.refCount > 0, `Reference count underflow for ${className}`);
    usage.refCount--;
    if(usage.refCount === 0) {
      this.unusedCount++;
      if(usage.canGarbageCollect) {
        this.canGcCount++;
      }
    }
  }

}

const styledRefCount = new StyledRefCount();
export default styledRefCount;