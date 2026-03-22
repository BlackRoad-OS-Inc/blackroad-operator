" BlackRoad Colorscheme
" Gradient: 208(orange)→202(red-orange)→198(pink)→163(magenta)→33(blue), 255(white)

set background=dark
hi clear
if exists("syntax_on")
  syntax reset
endif
let g:colors_name = "blackroad"

" UI Elements
hi Normal       ctermfg=255  ctermbg=233  cterm=NONE
hi LineNr       ctermfg=240  ctermbg=NONE cterm=NONE
hi CursorLine   ctermfg=NONE ctermbg=234  cterm=NONE
hi CursorLineNr ctermfg=208  ctermbg=234  cterm=bold
hi Visual       ctermfg=255  ctermbg=238  cterm=NONE
hi StatusLine   ctermfg=255  ctermbg=236  cterm=bold
hi StatusLineNC ctermfg=240  ctermbg=234  cterm=NONE
hi VertSplit    ctermfg=236  ctermbg=236  cterm=NONE
hi Pmenu        ctermfg=255  ctermbg=235  cterm=NONE
hi PmenuSel     ctermfg=233  ctermbg=208  cterm=bold

" Syntax - The Gradient
hi Comment      ctermfg=240  cterm=italic
hi String       ctermfg=33   cterm=NONE
hi Number       ctermfg=198  cterm=NONE
hi Float        ctermfg=198  cterm=NONE
hi Boolean      ctermfg=163  cterm=bold
hi Constant     ctermfg=163  cterm=NONE
hi Identifier   ctermfg=255  cterm=NONE
hi Function     ctermfg=208  cterm=bold
hi Statement    ctermfg=202  cterm=bold
hi Keyword      ctermfg=202  cterm=NONE
hi Conditional  ctermfg=198  cterm=NONE
hi Operator     ctermfg=255  cterm=NONE
hi Type         ctermfg=163  cterm=NONE
hi Special      ctermfg=33   cterm=NONE
hi PreProc      ctermfg=208  cterm=NONE
hi Todo         ctermfg=233  ctermbg=208  cterm=bold
hi Error        ctermfg=255  ctermbg=196  cterm=bold
hi MatchParen   ctermfg=208  ctermbg=238  cterm=bold

" Diff
hi DiffAdd      ctermfg=33   ctermbg=234  cterm=NONE
hi DiffDelete   ctermfg=198  ctermbg=234  cterm=NONE
hi DiffChange   ctermfg=208  ctermbg=234  cterm=NONE

" Search
hi Search       ctermfg=233  ctermbg=208  cterm=bold
hi IncSearch    ctermfg=233  ctermbg=255  cterm=bold
