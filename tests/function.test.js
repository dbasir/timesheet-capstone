const isEmpty=require('./function');

test('isEmpty()', () => {
    result = isEmpty('');
    expect(result).toBeTruthy();
    result = isEmpty(' ');
    expect(result).toBeFalsy();
  });