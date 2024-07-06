import { Ticket } from '../ticket'

describe('ticket model', () => {
  it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
      price: 100.00,
      title: 'title',
      userId: 'userId'
    })
    const { id } = await ticket.save()
 
    const ticket1 = await Ticket.findById(id)
    const ticket2 = await Ticket.findById(id)

    ticket1.set({
      price: 200.00,
      title: 'title-update'
    })

    ticket2.set({
      price: 200.00,
      title: 'title-update'
    })

    await ticket1.save()

    let error

    try {
      await ticket2.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
  })
  it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
      price: 100.00,
      title: 'title',
      userId: 'userId'
    })
    const { version: version1 } = await ticket.save()

    expect(version1).toEqual(0)

    const { version: version2 } = await ticket.save()

    expect(version2).toEqual(1)

    const { version: version3 } = await ticket.save()

    expect(version3).toEqual(2)
  })
})