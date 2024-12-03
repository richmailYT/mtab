import {
  AnimationInitialType,
  BookmarkTiming,
  Config,
  UIStyle,
  UserDefinedBookmark
} from "src/newtab/scripts/config";
import {
  buildChromeBookmarksTree,
  renderDefaultBlockyBookmarksNodes
} from "src/newtab/scripts/utils/bookmarks/bookmark-default-blocky-utils";
import { openBookmark } from "src/newtab/scripts/utils/bookmarks/bookmark-utils";
import { focusElementBorder, unfocusElementBorder } from "src/newtab/scripts/utils/focus-utils";

export const openBookmarkFolder = (
  chromeBookmarks: chrome.bookmarks.BookmarkTreeNode[],
  folderToLeaveId: string,
  newFolderId: string,
  config: Config,
  showBackButton: boolean
) => {
  // prettier-ignore
  const oldContainerEl = document.getElementById(`bookmark-folder-container-${folderToLeaveId}`) as HTMLDivElement;

  // prettier-ignore
  let newFolderChildren: chrome.bookmarks.BookmarkTreeNode[] = [];

  if (showBackButton) {
    newFolderChildren = chromeBookmarks.filter((bookmark) => bookmark.parentId === newFolderId);
  } else {
    const chromeBookmarksTree = buildChromeBookmarksTree(chromeBookmarks);
    newFolderChildren = chromeBookmarksTree;
  }

  if (config.animations.enabled) {
    oldContainerEl.classList.add(config.animations.bookmarkType);
    const computedStyle = getComputedStyle(oldContainerEl);
    const animationDuration = parseFloat(computedStyle.animationDuration) * 1000;

    setTimeout(() => {
      oldContainerEl.style.opacity = "0%";
    }, animationDuration - 10);

    setTimeout(() => {
      oldContainerEl.parentNode!.removeChild(oldContainerEl);
      renderDefaultBlockyBookmarksNodes(
        newFolderId,
        newFolderChildren,
        chromeBookmarks,
        config,
        showBackButton
      );
    }, animationDuration + 20);
  } else {
    oldContainerEl.parentNode!.removeChild(oldContainerEl);
    renderDefaultBlockyBookmarksNodes(
      newFolderId,
      newFolderChildren,
      chromeBookmarks,
      config,
      showBackButton
    );
  }
};

export const renderBlockBookmark = (
  containerEl: HTMLDivElement,
  bookmarkTiming: BookmarkTiming,
  bookmarksLength: number,
  bookmarkIndex: number,
  bookmarkName: string,
  bookmarkColor: string,
  bookmarkIconColor: string | null,
  bookmarkIconType: string | null,
  bookmarkIconHTML: string,
  uiStyle: UIStyle,
  showName: boolean,
  bookmarkVanityName: string,
  nameTextColor: string,
  animationsEnabled: boolean,
  animationsInitialType: AnimationInitialType
) => {
  let delay = 0;

  if (bookmarkTiming === "uniform") delay = 150;
  else if (bookmarkTiming === "left") delay = (bookmarkIndex + 2) * 50;
  else if (bookmarkTiming === "right") delay = (bookmarksLength + 2 - bookmarkIndex) * 50;

  let iconHTML = bookmarkIconHTML;
  let iconSizeClass = "";

  if (bookmarkIconType) {
    if (bookmarkIconType.startsWith("ri-")) {
      iconHTML = `<i class="${bookmarkIconType}"></i>`;
      iconSizeClass = "text-4xl md:text-6xl";
    } else if (bookmarkIconType.startsWith("nf-")) {
      iconHTML = `<i class="nf ${bookmarkIconType}"></i>`;
      iconSizeClass = "text-5xl md:text-7xl";
    } else if (bookmarkIconType.startsWith("url-")) {
      const src = bookmarkIconType.split("url-")[1];
      iconHTML = `<img class="w-10 md:w-14" src="${src}" />`;
    }
  }

  // <button id="bookmark-${bookmarkName}-${bookmarkIndex}" class="relative duration-[250ms] ease-out bg-foreground cursor-pointer ${uiStyle === "glass" ? "glass-effect" : ""} corner-style h-bookmark overflow-hidden ${animationsEnabled ? `${animationsInitialType} opacity-0 outline-none` : ""}" ${animationsEnabled ? `style="animation-delay: ${delay}ms;"` : ""}>
  //   <div id="bookmark-${bookmarkName}-${bookmarkIndex}-border" class="absolute w-full h-full border-2 border-transparent corner-style"></div>
  //   <div class="h-1" style="background-color: ${bookmarkColor}"></div>
  //   <div class="absolute w-full h-full hover:bg-white/20"></div>
  //   <div class="p-1 md:p-2 grid place-items-center h-full">
  //     <div class="bookmark-icon${iconSizeClass && " " + iconSizeClass}"${bookmarkIconColor ? ` style="color: ${bookmarkIconColor};"` : ""}>
  //       ${iconHTML}
  //     </div>
  //     ${showName ? `<span class="visibilty-bookmark-name w-full font-message font-semibold text-base text-ellipsis overflow-hidden whitespace-nowrap" style="color: ${nameTextColor}">${bookmarkVanityName}</span>` : ""}
  //   </div>
  // </button>

  const buttonEl = document.createElement("button");
  buttonEl.id = `bookmark-${bookmarkName}-${bookmarkIndex}`;
  buttonEl.className = `relative duration-[250ms] ease-out bg-foreground cursor-pointer ${
    uiStyle === "glass" ? "glass-effect" : ""
  } corner-style h-bookmark overflow-hidden ${
    animationsEnabled ? `${animationsInitialType} opacity-0 outline-none` : ""
  }`;
  if (animationsEnabled) buttonEl.style.animationDelay = `${delay}ms`;

  const borderDiv = document.createElement("div");
  borderDiv.id = `bookmark-${bookmarkName}-${bookmarkIndex}-border`;
  borderDiv.className = "absolute w-full h-full border-2 border-transparent corner-style";
  buttonEl.appendChild(borderDiv);

  const colorDiv = document.createElement("div");
  colorDiv.className = "h-1";
  colorDiv.style.backgroundColor = bookmarkColor;
  buttonEl.appendChild(colorDiv);

  const hoverDiv = document.createElement("div");
  hoverDiv.className = "absolute w-full h-full hover:bg-white/20";
  buttonEl.appendChild(hoverDiv);

  const contentDiv = document.createElement("div");
  contentDiv.className = "p-1 md:p-2 grid place-items-center h-full";

  const iconDiv = document.createElement("div");
  iconDiv.className = `bookmark-icon${iconSizeClass ? " " + iconSizeClass : ""}`;
  if (bookmarkIconColor) iconDiv.style.color = bookmarkIconColor;
  iconDiv.innerHTML = iconHTML;
  contentDiv.appendChild(iconDiv);

  if (showName) {
    const nameSpan = document.createElement("span");
    nameSpan.className =
      "visibilty-bookmark-name w-full font-message font-semibold text-base text-ellipsis overflow-hidden whitespace-nowrap";
    nameSpan.style.color = nameTextColor;
    nameSpan.textContent = bookmarkVanityName;
    contentDiv.appendChild(nameSpan);
  }

  buttonEl.appendChild(contentDiv);
  containerEl.appendChild(buttonEl);
};

export const bindActionsToBlockNode = (
  node: chrome.bookmarks.BookmarkTreeNode,
  index: number,
  chromeBookmarks: chrome.bookmarks.BookmarkTreeNode[],
  config: Config
) => {
  // if default-blocky or user-defined
  const identifier = node.id ? node.id : (node as unknown as UserDefinedBookmark).name;

  // prettier-ignore
  const bookmarkEl = document.getElementById(`bookmark-${identifier}-${index}`) as HTMLButtonElement;
  // prettier-ignore
  const bookmarkBorderEl = document.getElementById(`bookmark-${identifier}-${index}-border`) as HTMLDivElement;

  if (bookmarkEl && config.animations.enabled) {
    const computedStyle = window.getComputedStyle(bookmarkEl);
    const animationDuration = parseFloat(computedStyle.animationDuration) * 1000;
    bookmarkEl.addEventListener(
      "animationstart",
      () => {
        // Fix weird flickering issue on firefox
        setTimeout(() => {
          bookmarkEl.classList.remove("opacity-0");
          // fix bookmarks animations replaying after bookmark search esc
          bookmarkEl.classList.remove(config.animations.initialType);
        }, animationDuration * 0.8); // needs to be less than 1
      },
      {
        once: true
      }
    );

    // Fix bookmarks disappearing if user leaves tab too quickly
    document.addEventListener("visibilitychange", () => {
      bookmarkEl.classList.remove("opacity-0");
    });
  }

  const isFolder = node.children && node.children!.length > 0;

  if (isFolder) {
    bookmarkEl.onmouseup = () =>
      openBookmarkFolder(chromeBookmarks, node.parentId!, node.id, config, true);
  } else {
    // can't be onclick in order to register middle click and can't be onmousedown because open in new tab fails
    bookmarkEl.onmouseup = (e) => {
      // open in new tab when holding ctrl or middle click
      if (e.ctrlKey || e.button === 1) {
        openBookmark(node.url!, config.animations.enabled, config.animations.bookmarkType, true);
      } else if (e.button === 0) {
        openBookmark(node.url!, config.animations.enabled, config.animations.bookmarkType);
      }
    };
  }

  bookmarkEl.addEventListener("blur", () => unfocusElementBorder(bookmarkBorderEl));
  bookmarkEl.addEventListener("focus", (e) =>
    focusElementBorder(bookmarkBorderEl, config.search.focusedBorderColor, e)
  );
};

export const bindActionsToBackButton = (
  folderId: string,
  chromeBookmarks: chrome.bookmarks.BookmarkTreeNode[],
  config: Config
) => {
  // prettier-ignore
  const backButtonEl = document.getElementById(`bookmark-folder-${folderId}-back-button`) as HTMLButtonElement;
  // prettier-ignore
  const backButtonBorderEl = document.getElementById(`bookmark-folder-${folderId}-border`) as HTMLDivElement;

  if (backButtonEl && config.animations.enabled) {
    const computedStyle = window.getComputedStyle(backButtonEl);
    const animationDuration = parseFloat(computedStyle.animationDuration) * 1000;
    backButtonEl.addEventListener(
      "animationstart",
      () => {
        setTimeout(() => {
          backButtonEl.classList.remove("opacity-0");
          backButtonEl.classList.remove(config.animations.initialType);
        }, animationDuration * 0.8); // needs to be less than 1
      },
      {
        once: true
      }
    );

    document.addEventListener("visibilitychange", () => {
      backButtonEl.classList.remove("opacity-0");
    });
  }

  backButtonEl.onclick = () => {
    const folderNode = chromeBookmarks.find((bookmark) => bookmark.id === folderId)!;
    // prettier-ignore
    const parentFolderNode = chromeBookmarks.find((bookmark) => bookmark.id === folderNode.parentId)!;

    const isTopLevel = typeof folderNode === "undefined";
    const isParentTopLevel = typeof parentFolderNode === "undefined";
    if (isTopLevel) return;

    openBookmarkFolder(chromeBookmarks, folderId, folderNode.parentId!, config, !isParentTopLevel);
  };

  backButtonEl.addEventListener("blur", () => unfocusElementBorder(backButtonBorderEl));
  backButtonEl.addEventListener("focus", (e) =>
    focusElementBorder(backButtonBorderEl, config.search.focusedBorderColor, e)
  );
};

export const renderBlockBookmarkFolder = (
  containerEl: HTMLDivElement,
  bookmarkTiming: BookmarkTiming,
  bookmarksLength: number,
  bookmarkIndex: number,
  bookmarkName: string,
  bookmarkColor: string,
  bookmarkIconColor: string | null,
  bookmarkIconType: string | null,
  bookmarkIconHTML: string,
  uiStyle: UIStyle,
  showName: boolean,
  bookmarkVanityName: string,
  nameTextColor: string,
  animationsEnabled: boolean,
  animationsInitialType: AnimationInitialType
) => {
  let delay = 0;

  if (bookmarkTiming === "uniform") delay = 150;
  else if (bookmarkTiming === "left") delay = (bookmarkIndex + 2) * 50;
  else if (bookmarkTiming === "right") delay = (bookmarksLength + 2 - bookmarkIndex) * 50;

  let iconHTML = bookmarkIconHTML;
  let iconSizeClass = "";

  if (bookmarkIconType) {
    if (bookmarkIconType.startsWith("ri-")) {
      iconHTML = `<i class="${bookmarkIconType}"></i>`;
      iconSizeClass = "text-4xl md:text-6xl";
    } else if (bookmarkIconType.startsWith("nf-")) {
      iconHTML = `<i class="nf ${bookmarkIconType}"></i>`;
      iconSizeClass = "text-5xl md:text-7xl";
    } else if (bookmarkIconType.startsWith("url-")) {
      const src = bookmarkIconType.split("url-")[1];
      iconHTML = `<img class="w-10 md:w-14" src="${src}" />`;
    }
  }

  // <button id="bookmark-${bookmarkName}-${bookmarkIndex}" class="relative duration-[250ms] ease-out bg-foreground cursor-pointer ${uiStyle === "glass" ? "glass-effect" : ""} corner-style h-bookmark overflow-hidden ${animationsEnabled ? `${animationsInitialType} opacity-0 outline-none` : ""}" ${animationsEnabled ? `style="animation-delay: ${delay}ms;"` : ""}>
  //   <div id="bookmark-${bookmarkName}-${bookmarkIndex}-border" class="absolute w-full h-full border-2 border-transparent corner-style"></div>
  //   <div class="h-1" style="background-color: ${bookmarkColor}"></div>
  //   <div class="absolute w-full h-full hover:bg-white/20"></div>
  //   <div class="p-1 md:p-2 grid place-items-center h-full">
  //     <div class="bookmark-icon${iconSizeClass && " " + iconSizeClass}"${bookmarkIconColor && ` style="color: ${bookmarkIconColor};"`}>
  //       ${iconHTML}
  //     </div>
  //     ${showName ? `<span class="visibilty-bookmark-name w-full font-message font-semibold text-base text-ellipsis overflow-hidden whitespace-nowrap" style="color: ${nameTextColor}">${bookmarkVanityName}</span>` : ""}
  //   </div>
  // </button>
  const buttonEl = document.createElement("button");
  buttonEl.id = `bookmark-${bookmarkName}-${bookmarkIndex}`;
  buttonEl.className = `relative duration-[250ms] ease-out bg-foreground cursor-pointer ${
    uiStyle === "glass" ? "glass-effect" : ""
  } corner-style h-bookmark overflow-hidden ${
    animationsEnabled ? `${animationsInitialType} opacity-0 outline-none` : ""
  }`;
  if (animationsEnabled) buttonEl.style.animationDelay = `${delay}ms`;

  const borderDiv = document.createElement("div");
  borderDiv.id = `bookmark-${bookmarkName}-${bookmarkIndex}-border`;
  borderDiv.className = "absolute w-full h-full border-2 border-transparent corner-style";
  buttonEl.appendChild(borderDiv);

  const colorDiv = document.createElement("div");
  colorDiv.className = "h-1";
  colorDiv.style.backgroundColor = bookmarkColor;
  buttonEl.appendChild(colorDiv);

  const hoverDiv = document.createElement("div");
  hoverDiv.className = "absolute w-full h-full hover:bg-white/20";
  buttonEl.appendChild(hoverDiv);

  const contentDiv = document.createElement("div");
  contentDiv.className = "p-1 md:p-2 grid place-items-center h-full";

  const iconDiv = document.createElement("div");
  iconDiv.className = `bookmark-icon${iconSizeClass ? " " + iconSizeClass : ""}`;
  if (bookmarkIconColor) iconDiv.style.color = bookmarkIconColor;
  iconDiv.innerHTML = iconHTML;
  contentDiv.appendChild(iconDiv);

  if (showName) {
    const nameSpan = document.createElement("span");
    nameSpan.className =
      "visibilty-bookmark-name w-full font-message font-semibold text-base text-ellipsis overflow-hidden whitespace-nowrap";
    nameSpan.style.color = nameTextColor;
    nameSpan.textContent = bookmarkVanityName;
    contentDiv.appendChild(nameSpan);
  }

  buttonEl.appendChild(contentDiv);
  containerEl.appendChild(buttonEl);
};
