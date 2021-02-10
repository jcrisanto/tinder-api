const {getRandomUser} = require("./../Routes/users");

test('When sending a like', () => {
    const users = [
        {
            id: '1',
            firstName: 'Marcus',
            password: 'anything'
        },
        {
            id: '2',
            firstName: 'Jorge',
            password: 'anything'
        }
    ]
    const userResponse = getRandomUser("2", users);
    expect(userResponse.id).toBe("1");
  });