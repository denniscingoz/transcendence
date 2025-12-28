# i18n (Frontend)

## Scope (Frontend responsibilities)
Frontend handles:
- all UI translations (labels, menus, buttons, pages) (front Framework has it's own json files with translations)
- language switcher
- locale formatting for dates/numbers
- storing selected language client-side (and  sending it to backend)

Backend handles:
- localized API errors and system messages

## Language choice
Frontend should:
- send `Accept-Language` on every request 
- - optionally set user preference via profile endpoint (backend stores `preferredLanguage`)
 
 **Important clarification:**
-  Frontend does **not** manually add Accept-Language to each request.
-  Frontend configures **one shared HTTP client** (e.g. fetch wrapper or axios instance).
-  This HTTP client **automatically attaches** **Accept-Language** based on the current UI language.
-  Backend uses Accept-Language to localize responses (errors, moderation messages, system texts).
    
**Result:**
All API requests consistently use the same language without duplicated logic in the frontend code.


## Fallback policy
If translation missing in UI:
- fallback to English
- do not break rendering
  

**Backend determines the response language using the following priority:**

1. User.preferredLanguage (if the user is authenticated and the value is set)
2. Accept-Language HTTP header
3. Default language (en)

if (user is authenticated AND user.preferredLanguage is set)
    use user.preferredLanguage
else if (Accept-Language header exists)
    use Accept-Language
else
    use default language (en)

