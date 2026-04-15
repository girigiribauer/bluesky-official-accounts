import Image from "next/image";
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
      <Image className={styles.image} src={imageSrc} alt={imageAlt} width={1960} height={600} />
    </a>
  );
};
