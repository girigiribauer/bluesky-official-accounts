import styles from "./ShareButtons.module.scss";

export const ShareButtons = () => {
  const encodedText = encodeURIComponent(
    `Bluesky 公式アカウント移行まとめ ${process.env.NEXT_PUBLIC_EXTERNAL_URL} #青空公式アカウント`
  );

  return (
    <ul className={styles.buttons}>
      <li>
        <a
          href={`https://x.com/intent/post?text=${encodedText}`}
          className={styles.twitter}
          target="_blank"
        >
          <img
            src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='32' height='32' fill='none'/%3E%3Cpath d='M17.9686 14.1623L26.7065 4H24.6358L17.0488 12.8238L10.9891 4H4L13.1634 17.3432L4 28H6.07069L14.0827 18.6817L20.4822 28H27.4714L17.9681 14.1623H17.9686ZM15.1326 17.4607L14.2041 16.132L6.81679 5.55961H9.99723L15.9589 14.0919L16.8873 15.4206L24.6368 26.5113H21.4564L15.1326 17.4612V17.4607Z' fill='white'/%3E%3C/svg%3E%0A"
            alt=""
            width="14"
            height="14"
          />
          <span>ポスト</span>
        </a>
      </li>
      <li>
        <a
          href={`https://bsky.app/intent/compose?text=${encodedText}`}
          className={styles.bluesky}
          target="_blank"
        >
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAcCAYAAAAAwr0iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGkSURBVHgBvZeBVcIwEIb/+hygI9QNcIO6gRv4mAA3aJ0AmQCZgOcEZQPcoHWC4gTnHT2eEUKai+D33rWlyd39Cek1BREVbFsakPNc7uHCcMycrWJrnVyFNDR0inR6xoXgWDO23pOnAYWR2ciRiI56GYjfjwkQtikiNPl2LLh07C8tIjY56Qy0FMfaIGAdGbNFpNID84jklSFeY1F74CmQfGYLRc0N+33Bxit56oTeq2GjEwEdbMhi9K2HRtssfIqAHexMeMT14QdfV3wqYGeXsfMj/CMadWa71+sWaTzc8uEDach0L2H/C126/ZH874NrI2sGmQooMSyi/+Quy7L9UwC+2PBpirQFaUVyTCX5SQsNe4M3ii/PFuSd460hXlTM+g9ievWVpBNYoPMbiFRait3g0LAJuRbVWPKSrk/p5rw50lDCxkbNQomAAOtjuGJ7h43ubAsNW6nYxdfS8KRYfKRf4eb8NQNcHGQGXhDHSoqJ+iwifRbeAnQMq6wjRp87/XMarxc1LAREnEyj9p8ERKR95NBPae7VGgqUUqc/Of2DVfAbQ2HzAOmkFq8AAAAASUVORK5CYII="
            alt=""
            width="16"
            height="14"
          />
          <span>Bluesky でポスト</span>
        </a>
      </li>
    </ul>
  );
};
