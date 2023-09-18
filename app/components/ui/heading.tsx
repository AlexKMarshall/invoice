import * as React from 'react'

import { Text } from './text'

export interface Heading extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
}

const headingLevelMap = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const

const Heading = React.forwardRef<HTMLHeadingElement, Heading>(
  ({ level, children, ...props }, ref) => {
    const Comp = headingLevelMap[level]

    return (
      <Text ref={ref} {...props} asChild>
        <Comp>{children}</Comp>
      </Text>
    )
  },
)
Heading.displayName = 'Heading'

export { Heading }
