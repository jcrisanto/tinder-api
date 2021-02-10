const {getRandomUser} = require("./../Routes/users");

test('When getting a random user, and sending an id of 2', () => {
    const users = [
        {
            id: '1',
            firstName: 'Marcus',
            password: 'anything'
        },
        {
            id: '2',
            firstName: 'Marie',
            password: 'anything'
        }
    ]
    const userResponse = getRandomUser("2", users);
    expect(userResponse.id).toBe("1");
    expect(userResponse.firstName).toBe("Marcus");
    expect(userResponse.password).toBe("n/a");
  });

  test('When getting a random user, and we only have 1 user in the list', () => {
    const users = [
        {
            id: '1',
            firstName: 'Marcus',
            password: 'anything'
        }
    ]
    const userResponse = getRandomUser("1", users);
    expect(userResponse).toBeNull();
  });