const Arrow: React.FC<{ rotate?: number, onClick?: () => void }> = ({ rotate=0, onClick }) =>
  <svg width={26} style={{ transform: `rotate(${rotate}deg)` }} onClick={onClick} focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowBackIcon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>

export default Arrow