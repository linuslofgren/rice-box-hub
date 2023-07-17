const Button: React.FC<{name: string, active?: boolean, onClick: () => void}> = ({ name, active, onClick }) => {
 
  return <div onClick={onClick} className="clickable hoverDarken"
    style={{
      padding: 10, paddingInline: 20, margin: 8, backgroundColor: active ? 'rgba(220, 220, 220, 0.4)' : 'rgba(244, 244, 244, 0.4)',
      borderRadius: 8, WebkitBackdropFilter: 'blur(1px)', backdropFilter: 'blur(1px)',
      color: active ? '#9d9696' : '#625c5c',
      verticalAlign: 'center',
      boxShadow: active ? '#afa3a3 1px 1px 3px inset, inset rgb(255 255 255 / 96%) -1px -1px 20px' : 'inset 3px 2px 4px white, 1px 1px 3px #84848496'
    }}>
    {name}
  </div>
}
export default Button