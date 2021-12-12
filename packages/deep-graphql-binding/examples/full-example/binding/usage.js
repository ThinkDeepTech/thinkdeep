const Binding = require('./binding')

const binding = new Binding()

binding.mutation
  .createUser(
    {
      data: {
        name: 'some user',
      },
    },
    '{id}',
  )
  .catch((e) => console.error(e))

binding.query
  .users({}, '{id}')
  .then((r) => {
    // eslint-disable-next-line
    console.log(r)
  })
  .catch((e) => console.error(e))
