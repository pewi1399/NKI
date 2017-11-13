rm(list = ls())
library(dplyr)
library(tidyr)
library(jsonlite)

dat <- openxlsx::read.xlsx("data/imagematning.xlsx")

longdata <- 
dat %>% 
  mutate(
    measure = sub("^\\s*(\\S+\\s+\\S+).*", "\\1", Nyckeltal),
    myndighet = sub("\\s*(\\S+\\s+\\S+) ", "", Nyckeltal)
    ) %>% 
  filter(myndighet %in% c("AMF", "Arbetsförmedlingen", "CSN", "Försäkringskassan", "Konsumentverket", 
                           "Kronofogden", "Migrationsverket", "Pensionsmyndigheten", "Polisen", 
                           "Skatteverket", "Swedbank")) %>%
  select(-Nyckeltal) %>% 
  gather(key, value, -myndighet, -Ar, -measure, -Text)

out <- 
longdata %>% 
  mutate(
    group = sub("Sparare|Pensionar", "", key),
    group = ifelse(group == "", "Samtliga", group),
    customer = sub("(Sparare|Pensionar)", "\\1_", key),
    customer = sub("_.*$", "", customer),
    value = ifelse(is.na(value), 0, value)
      ) %>% 
  select(-key)



writeLines(paste0("var data = ", toJSON(out)), "data/imgdata.js", useBytes = TRUE)
