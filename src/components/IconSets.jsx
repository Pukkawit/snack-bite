const IconSets = ({
  name,
  width = 24,
  height = 24,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <svg className={className} style={style} width={width} height={height}>
      <use xlinkHref={`/icons/icon-set.svg#${name}`} />
    </svg>
  );
};
export default IconSets;

/* 

<IconSets
  name="three-dots"
  height={24}
  width={24}
  className="text-dark-secondary opacity-50 hover:opacity-100 transition-opacity duration-200 w-3 h-3 md:w-4 md:h-4"
/>

*/
