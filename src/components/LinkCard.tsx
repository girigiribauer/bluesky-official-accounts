import styles from "./LinkCard.module.scss";

type LinkCardProps = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
};

export const LinkCard = ({
  href,
  title,
  description,
  imageSrc,
  imageAlt = "",
}: LinkCardProps) => {
  return (
    <a className={styles.card} href={href}>
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>
      <img className={styles.image} src={imageSrc} alt={imageAlt} />
    </a>
  );
};
