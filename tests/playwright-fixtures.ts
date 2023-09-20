import { expect, test as testBase } from '@playwright/test'

export type TestOptions = {
  isOffline: boolean
}

const test = testBase.extend<TestOptions>({
  isOffline: [false, { option: true }],
})

export { expect, test }
