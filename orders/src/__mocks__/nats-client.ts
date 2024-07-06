export const wrapper = {
  client: {
    publish: jest.fn().mockImplementation((subject: string, data: string, callback: (err: Error, guid: string) => void) => callback(null, 'guid'))
  }
}