// @ts-ignore
declare global {
    interface Window {
      readingMode: boolean
      toggleReadingMode: (active: boolean) => void
      saveState: (state: boolean) => void
    }
  }
  
  let notesContainer: HTMLDivElement | null = null
  let readingMode = false
  let handleScroll: (() => void) | null = null
  let observerRM: MutationObserver | null = null
  let originalTocPosition: { parent: HTMLElement; element: HTMLElement } | null = null
  let readingModeHint: HTMLDivElement | null = null
  
  // Cleanup Function
  const cleanup = () => {
      if (notesContainer) {
          notesContainer.remove()
          notesContainer = null
      }
  
      if (handleScroll) {
          window.removeEventListener('scroll', handleScroll)
          window.removeEventListener('resize', handleScroll)
          window.removeEventListener('hashchange', handleScroll)
          window.removeEventListener('popstate', handleScroll)
          window.removeEventListener('wheel', handleScroll)
      }
  
      if (observerRM) {
          observerRM.disconnect()
          observerRM = null
      }
  
      // Restore TOC position
      const toc = document.querySelector('.toc')
      if (toc && originalTocPosition) {
          if (originalTocPosition.element) {
              originalTocPosition.element.style.display = ''
          }
          originalTocPosition = null
          toc.classList.remove('visible')
      }
  }
  
  // Removal Tips
  const removeHint = () => {
      if (readingModeHint) {
          readingModeHint.remove()
          readingModeHint = null
      }
  }
  
  // Scroll to the specified element
  const scrollToElement = (element: Element) => {
      const offset = 80
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.scrollY
      
      // Using the new ScrollToOptions type
      const scrollOptions: ScrollToOptions = {
          top: absoluteElementTop - offset,
          behavior: 'smooth'
      }
      
      try {
          window.scrollTo(scrollOptions)
      } catch (e) {
          // Compatible with browsers that do not support smooth scrolling
          window.scrollTo(0, absoluteElementTop - offset)
      }
  }
  
  // Modify anchor link behavior
  const adjustAnchorClick = () => {
      const allAnchors = document.querySelectorAll('a[href^="#"]')
      allAnchors.forEach(anchor => {
          anchor.addEventListener('click', (e) => {
              e.preventDefault()
              const href = anchor.getAttribute('href')
              if (!href) return
  
              const targetElement = document.querySelector(href)
              if (targetElement) {
                  scrollToElement(targetElement)
                  history.pushState(null, '', href)
              }
          })
      })
  }
  
  // Anti-shake function
  function debounce(func: Function, wait: number) {
      let timeout: number
      return function executedFunction(...args: any[]) {
          const later = () => {
              clearTimeout(timeout)
              func(...args)
          }
          clearTimeout(timeout)
          timeout = window.setTimeout(later, wait)
      }
  }
  
  // Update side bet position
  const updateNotePositions = () => {
      if (!notesContainer) return
  
      const article = document.querySelector('article')
      if (!article) return
  
      const refs = Array.from(article.querySelectorAll('a[data-footnote-ref]')).filter(ref =>
          !ref.closest('.popover')
      )
  
      let lastBottom = -Infinity
      const minGap = 20
  
      const noteDivs = Array.from(notesContainer.children) as HTMLElement[]
      const noteHeights = noteDivs.map(div => {
          const style = getComputedStyle(div)
          return parseFloat(style.paddingTop)
              + parseFloat(style.paddingBottom)
              + parseFloat(style.minHeight || '0')
      })
  
      refs.forEach((ref, index) => {
          const noteDiv = notesContainer?.children[index] as HTMLElement
          if (!noteDiv) return
  
          const refRect = ref.getBoundingClientRect()
          let newTop = refRect.top
  
          const totalGap = minGap + noteHeights[index]
  
          if (newTop < lastBottom + totalGap) {
              newTop = lastBottom + totalGap
          }
  
          noteDiv.style.transform = `translate3d(0, ${newTop}px, 0) translateY(-50%)`
          lastBottom = newTop + noteHeights[index]
  
          const isVisible = refRect.top >= -totalGap &&
              refRect.top <= window.innerHeight + totalGap
  
          noteDiv.style.opacity = isVisible ? '1' : '0'
      })
  }
  
  // Initializing side notes
  const initializeSideNotes = () => {
      cleanup()
  
      const footnotes = document.querySelector('article .footnotes')
      if (!footnotes) return
  
      const article = document.querySelector('article')
      if (!article) return
  
      notesContainer = document.createElement('div')
      notesContainer.className = 'side-notes-container'
  
      const articleReact = article.getBoundingClientRect()
      notesContainer.style.cssText = `
          position: fixed;
          top: 0;
          right: ${articleReact.right + 80}px;
          width: 300px;
          height: 100vh;
          pointer-events: none;
          z-index: 1000;
      `
  
      const refs = Array.from(article.querySelectorAll('a[data-footnote-ref]')).filter(ref =>
          !ref.closest('.popover')
      )
      const notes = Array.from(footnotes.querySelectorAll('li[id^="user-content-fn-"]')).filter(note => {
          return !note.closest('.popover') &&
              refs.some(ref => {
                  const refId = ref.id.replace('user-content-fnref-', '')
                  const noteId = note.id.replace('user-content-fn-', '')
                  return refId === noteId
              })
      })
  
      if (refs.length === 0 || notes.length === 0) return
  
      refs.forEach((ref, index) => {
          const refId = ref.id.replace('user-content-fnref-', '')
          const note = notes.find(n => n.id === `user-content-fn-${refId}`)
          if (!note) return
  
          const refNumber = (index + 1).toString()
          
          const noteDiv = document.createElement('div')
          noteDiv.className = 'side-note'
          noteDiv.dataset.noteId = refId
  
          noteDiv.style.cssText = `
              position: absolute;
              top: 0;
              right: 0;
              opacity: 0;
              transition: opacity 0.3s ease, transform 0.2s ease;
          `
  
          const content = note.cloneNode(true) as HTMLElement
          const backref = content.querySelector('.data-footnote-backref')
          const backrefHref = backref?.getAttribute('href') || `#user-content-fnref-${refId}`
          backref?.remove()
  
          noteDiv.innerHTML = `
              <div class="note-number" role="button" tabindex="0" data-href="${backrefHref}">${refNumber}</div>
              <div class="note-content">${content.innerHTML}</div>
          `
  
          const noteNumber = noteDiv.querySelector('.note-number')
          if (noteNumber) {
              noteNumber.addEventListener('click', () => {
                  const href = noteNumber.getAttribute('data-href')
                  if (!href) return
  
                  const targetElement = document.querySelector(href)
                  if (targetElement) {
                      scrollToElement(targetElement)
                      history.pushState(null, '', href)
                  }
              })
          }
  
          if(notesContainer) {
            notesContainer.appendChild(noteDiv)
          }
      })
  
      document.body.appendChild(notesContainer)
  
      handleScroll = debounce(() => {
          requestAnimationFrame(updateNotePositions)
      }, 10)
  
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
      window.addEventListener('hashchange', handleScroll)
      window.addEventListener('popstate', handleScroll)
      window.addEventListener('wheel', handleScroll)
  
      setTimeout(updateNotePositions, 100)
  
      observerRM = new MutationObserver(() => {
          if (handleScroll) handleScroll()
      })
  
      observerRM.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
      })
  
      adjustAnchorClick()
  }
  
  // Create a reading mode prompt
  const createReadingModeHint = () => {
      const existingHint = document.querySelector('.reading-mode-hint')
      if (existingHint) existingHint.remove()
  
      const hint = document.createElement('div')
      hint.className = 'reading-mode-hint no-print'
      hint.textContent = 'Press ESC to exit reading mode'
      hint.style.cursor = 'pointer'
      document.body.appendChild(hint)
  
      // Exit reading mode
      const exitReadingMode = (e: Event) => {
          e.preventDefault()
          // @ts-ignore
          window.toggleReadingMode(false)
          // @ts-ignore
          window.saveState(false)
          // @ts-ignore
          window.readingMode = false
          // Remove focus from a button
          const button = document.querySelector('.reading-mode-toggle')
          if (button instanceof HTMLElement) {
              button.blur()
          }
      }
  
      // 处理 ESC 按键
      const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              e.preventDefault()
              exitReadingMode(e)
          }
      }
  
      hint.addEventListener('click', exitReadingMode)
      document.addEventListener('keydown', handleEsc)
      
      // Save references for later cleanup
      readingModeHint = hint
  }
  
  // Create a Welcome Message
  const createWelcomeMessage = () => {
      const welcome = document.createElement('div')
      welcome.className = 'reading-mode-welcome'
      welcome.textContent = 'Entering Reading Mode'
      document.body.appendChild(welcome)
  
      setTimeout(() => {
          welcome.style.opacity = '0'
          setTimeout(() => welcome.remove(), 300)
      }, 2000)
  }
  
  // Switch to reading mode
  const toggleReadingMode = (active: boolean) => {
      const button = document.querySelector('.reading-mode-toggle')
      if (!button) return
  
      button.classList.toggle('active', active)
      document.documentElement.classList.toggle('reading-mode', active)
  
      const sidebars = document.querySelectorAll('.sidebar') as NodeListOf<HTMLElement>
      const leftSidebar = document.querySelector('.left.sidebar') as HTMLElement
    //   const toc = document.querySelector('.toc') as HTMLElement | null
  
      // Clean up existing clone TOC
    //   const existingTocClone = document.querySelector('.toc-clone')
    //   if (existingTocClone) {
    //       existingTocClone.remove()
    //   }
  
      if (active) {
          createWelcomeMessage()
          
          // Make sure the left sidebar is visible
        //   if (leftSidebar) {
            //   leftSidebar.classList.add('reading-mode-active')
              
              // Copy and move the TOC
            //   if (toc) {
            //     //   console.log('Moving TOC to left sidebar')
            //       const tocClone = toc.cloneNode(true) as HTMLElement
            //       originalTocPosition = {
            //           parent: toc.parentElement as HTMLElement,
            //           element: toc
            //       }
  
            //       // Hide original TOC
            //       toc.style.display = 'none'
                  
            //       // Add cloned TOC
            //       tocClone.classList.add('toc-clone')
            //       leftSidebar.appendChild(tocClone)
                  
            //       // Rebind events for cloned TOC
            //       const links = tocClone.querySelectorAll('a')
            //       links.forEach(link => {
            //           link.addEventListener('click', (e) => {
            //               e.preventDefault()
            //               const href = link.getAttribute('href')
            //               if (href) {
            //                   const target = document.querySelector(href)
            //                   if (target) {
            //                       target.scrollIntoView({ behavior: 'smooth' })
            //                   }
            //               }
            //           })
            //       })
  
            //       // Delay adding visibility classes to ensure transition animations take effect
            //       requestAnimationFrame(() => {
            //           tocClone.classList.add('visible')
            //       })
                  
            //     //   console.log('TOC cloned and moved')
            //   }
  
              // Delay the ESC prompt to avoid overlapping with TOC
            //   setTimeout(createReadingModeHint, 300)
        //   }

            sidebars.forEach(sidebar => sidebar.classList.add('reading-mode-active'))
          setTimeout(createReadingModeHint, 300)

  
          // Hide other elements
          requestAnimationFrame(() => {
              sidebars.forEach(sidebar => {
                  if (sidebar.classList.contains('left')) {
                      Array.from(sidebar.children).forEach(child => {
                          if (!child.classList.contains('reading-mode-visible') && child instanceof HTMLElement) {
                              child.classList.add('hidden-in-reading-mode')
                          }
                      })
                  } else {
                    console.log(sidebar.children)
                    Array.from(sidebar.children).forEach(child => {
                        if(!child.classList.contains('reading-mode-visible') && child instanceof HTMLElement) {
                            child.classList.add('hidden-in-reading-mode')
                        }
                    })
                  }
              })
          })
  
          setTimeout(initializeSideNotes, 100)
      } else {
          cleanup()
          
          requestAnimationFrame(() => {
            // Restore visibility of all elements
            sidebars.forEach(sidebar => {
                sidebar.classList.remove('hidden-in-reading-mode', 'reading-mode-active')
                if (sidebar.classList.contains('left')) {
                    Array.from(sidebar.children).forEach(child => {
                        if (child instanceof HTMLElement) {
                            child.classList.remove('hidden-in-reading-mode')
                        }
                    })
                }
            })
          })
          
  
        //   // Restore TOC
        //   if (originalTocPosition?.element) {
        //       originalTocPosition.element.style.display = ''
        //       originalTocPosition = null
        //   }
  
          // Removal Tips
          const hint = document.querySelector('.reading-mode-hint')
          if (hint) hint.remove()
      }
  
      button.setAttribute('aria-pressed', active.toString())
  }
  
  // Save state
  const saveState = (state: boolean) => {
      localStorage.setItem('readingMode', state.toString())
  }
  
  // Set reading mode
  const setupReadingMode = () => {
      const button = document.querySelector('.reading-mode-toggle')
      if (!button) return
  
      const savedState = localStorage.getItem('readingMode') === 'true'
      if (savedState) {
          readingMode = true
          toggleReadingMode(true)
      }
  
      const handleClick = () => {
          readingMode = !readingMode
          toggleReadingMode(readingMode)
          saveState(readingMode)
      }
      button.addEventListener('click', handleClick)
      window.addCleanup(() => button.removeEventListener('click', handleClick))
  
      const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && readingMode) {
              readingMode = false
              toggleReadingMode(false)
              saveState(false)
          }
          // Detect CTRL or COMMAND + J
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault(); // Prevent default browser action, if needed
            handleClick();
        }
      }
      document.addEventListener('keydown', handleKeydown)
      window.addCleanup(() => document.removeEventListener('keydown', handleKeydown))
  
      // @ts-ignore
      window.readingMode = readingMode
      // @ts-ignore
      window.toggleReadingMode = toggleReadingMode
      // @ts-ignore
      window.saveState = saveState
  }
  
  document.addEventListener('nav', () => {
      setTimeout(setupReadingMode, 0)
  })