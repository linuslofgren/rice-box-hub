import styled from 'styled-components'

const rainbowCss = (props: any) => `
  &::after {
    content: "${props.text}";
    position: absolute;
    background-color: ${props.selected ? 'rgba(220, 220, 220, 1)' : 'rgba(244, 244, 244, 1)'};
    height: 93%;
    width: 97%;
    top: 3.5%;
    left: 1.5%;
    border-radius: 7px;
    display: grid;
    place-items: center;
  }
  &::before {
    content: "";
    height: 200px; width: 200px;
    position: absolute;
    background: conic-gradient( #fd004c, #fe9000, #fff020, #3edf4b, #3363ff, #b102b7, #fd004c );
    left: -50px;
    top: -50px;
    animation: spin 1.5s infinite linear;
  }
  @keyframes spin{
    100%{
        transform: rotate(-360deg);
    }
  }
`
const Container = styled.div<{ selected: boolean, text: string, rainbow: boolean }>`
  position: relative;
  padding: 10px;
  padding-inline: 20px;
  margin: 8px;
  border-radius: 8px;
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  vertical-align: center;
  color: ${props => props.selected ? '#9d9696' : '#625c5c'};
  background-color: ${props => props.selected ? 'rgba(220, 220, 220, 0.4)' : 'rgba(244, 244, 244, 0.4)'};
  box-shadow: ${props => props.selected ? '#afa3a3 1px 1px 3px inset, inset rgb(255 255 255 / 96%) -1px -1px 20px' : 'inset 3px 2px 4px white, 1px 1px 3px #84848496'};
  overflow: hidden;
  cursor: pointer;

  ${props => props.rainbow && rainbowCss(props)}
`

const Button: React.FC<{name: string, active?: boolean, onClick: () => void, rainbow?: boolean}> = ({ name, active, onClick, rainbow }) => {
  return <Container text={name} selected={!!active} onClick={onClick} rainbow={!!rainbow}>
    {name}
  </Container>
}
export default Button