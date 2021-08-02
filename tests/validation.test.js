const isLength=require('./validation');

test('isLength()', () => {
    value = isLength('fffdfbszsgddgs');
    expect(value).toBeFalsy();
    result = isLength('sa');
    expect(result).toBeTruthy();

  });