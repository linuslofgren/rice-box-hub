import React from 'react'
import styled from 'styled-components'

type Props = {
  onUp: () => void
  onDown: () => void
  show?: boolean
}

const UpDownBtn: React.FC<Props> = ({ onDown, onUp, show }) => {
  return (
    <div className="hideable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Up onClick={onUp} />
      <Down onClick={onDown}  />
    </div>
  )
}

export default UpDownBtn

const A = styled.div<{ up?: boolean }>`
  margin-top: 5px;
  cursor: pointer;
  transition: transform 200ms;
  :hover {
    transform: translateY(${props => props.up ? '-' : ''}2px);
  }
`
const Down: React.FC<any> = (props) => <A {...props}>
  <svg width={16} focusable="false" aria-hidden="true" viewBox="6 6 12 12" data-testid="KeyboardArrowDownIcon"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>
</A>
const Up: React.FC<any> = (props) => <A up {...props}>
  <svg width={16} focusable="false" aria-hidden="true" viewBox="6 6 12 12" data-testid="KeyboardArrowUpIcon"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
</A>