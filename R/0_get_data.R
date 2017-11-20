rm(list = ls())
library(dplyr)
library(tidyr)
library(jsonlite)

dat <- openxlsx::read.xlsx("data/Imagemätning nyckeltal 17 nov 2017.xlsx")

names(dat) <- gsub("Pensionar", "Pensionär", names(dat))
names(dat) <- gsub("Hog", "Hög", names(dat))
names(dat) <- gsub("Lag", "Låg", names(dat))
#tmp <- 
#dat %>% 
#  filter(Nyckeltal == "Förtroende för Arbetsförmedlingen")


longdata <- 
dat %>% 
  mutate(
    measure = sub("^\\s*(\\S+\\s+\\S+).*", "\\1", Nyckeltal),
    measure = gsub("Förtroendet", "Förtroende", measure),
    myndighet = sub("\\s*(\\S+\\s+\\S+) ", "", Nyckeltal)
    ) %>% 
  filter(myndighet %in% c("AMF", "Arbetsförmedlingen", "CSN", "Försäkringskassan", "Konsumentverket", 
                           "Kronofogden", "Migrationsverket", "Pensionsmyndigheten", "Polisen", 
                           "Skatteverket", "Swedbank")) %>%
  select(-Nyckeltal) %>% 
  gather(key, value, -myndighet, -Ar, -measure)

# tmp <- longdata %>% 
#   filter(myndighet == "Arbetsförmedlingen" & measure == "Förtroende för" & År == 2011)
# 
# tmp <- 
#   longdata %>% 
#   filter(myndighet == "Arbetsförmedlingen" & measure == "Förtroende för" & År == 2011)

out <- 
longdata %>% 
  mutate(
    group = sub("Sparare|Pensionär", "", key),
    group = ifelse(group == "", "Samtliga", group),
    customer = sub("(Sparare|Pensionär)", "\\1_", key),
    customer = sub("_.*$", "", customer),
    value = ifelse(is.na(value), 0, value),
    type =  paste0(measure, ' ', myndighet, ' ', customer,  ' ', group, ' ', Ar)
      ) %>%
  filter(!duplicated(type)) %>%
  filter(value != "NULL") %>% 
  select(-key, -type)


writeLines(paste0("var data = ", toJSON(out)), "data/imgdata.js", useBytes = TRUE)
