import { Config } from "src/newtab/scripts/config";
import { bookmarksContainerEl } from "src/newtab/scripts/ui";
import {
  bindActionsToBlockBookmark,
  focusBookmark,
  renderBlockBookmark,
  unfocusBookmark
} from "src/newtab/scripts/utils/bookmark-utils";

// animations handled separately
export const renderUserDefinedBookmarks = (config: Config) => {
  bookmarksContainerEl.classList.add("w-full", "grid", "gap-2", "user-defined-bookmarks-cols");

  const userDefinedBookmarkCss = `
.user-defined-bookmarks-cols {
  grid-template-columns: 1fr 1fr;
}

@media (min-width: 768px) {
  .user-defined-bookmarks-cols {
    grid-template-columns: repeat(${config.bookmarks.userDefinedCols}, minmax(0, 1fr));
  }
}
`;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(userDefinedBookmarkCss));
  document.head.appendChild(styleElement);

  config.bookmarks.userDefined.forEach((bookmark, index) => {
    renderBlockBookmark(
      config.animations.bookmarkTiming,
      config.bookmarks.userDefined.length,
      index,
      bookmark.name,
      bookmark.color,
      bookmark.iconColor,
      bookmark.iconType,
      "",
      config.ui.style,
      config.animations.enabled,
      config.animations.initialType
    );
  });

  config.bookmarks.userDefined.forEach((bookmark, index) => {
    // prettier-ignore
    const bookmarkEl = document.getElementById(`bookmark-${bookmark.name}-${index}`) as HTMLDivElement;
    // prettier-ignore
    const bookmarkBorderEl = document.getElementById(`bookmark-${bookmark.name}-${index}-border`) as HTMLDivElement;

    bookmarkEl.addEventListener("blur", () => unfocusBookmark(bookmarkBorderEl));
    bookmarkEl.addEventListener("focus", (e) => focusBookmark(bookmarkBorderEl, config, e));
  });

  config.animations &&
    config.bookmarks.userDefined.forEach((bookmark, index) => {
      console.log("SOmething", index);
      bindActionsToBlockBookmark(
        bookmark.name,
        index,
        bookmark.url!,
        config.animations.enabled,
        config.animations.initialType,
        config.animations.bookmarkType
      );
    });
};
