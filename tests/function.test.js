const isEmpty=require('./function');

const checkIfEmpty=require('./function');


  test('checkIfEmpty()', () => {
    result = checkIfEmpty(' ');
    // { valid: false, error: 'Must not be empty'}
    expect(result).toEqual(false);
    result = checkIfEmpty('John Doe');
    expect(result).toEqual(true);

  });